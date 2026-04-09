# AWS EC2 & RDS Deployment Guide for ReliefConnect

This guide walks you through the entire process of deploying your ReliefConnect platform using **Amazon RDS** (for a managed MySQL database) and **Amazon EC2** (for hosting your Node.js backend and Next.js frontend).

---

## Phase 1: Set Up the Database (Amazon RDS for MySQL)

We set up the database first so that we have the endpoint details ready when deploying our application code.

### 1. Create the Database
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Search for **RDS** in the top search bar and select it.
3. Click **Create database**.
4. Select **Standard create**.
5. Engine options: Select **MySQL**. (Choose version 8.0.x).
6. Templates: Select **Free tier** (if eligible) or **Production** based on your needs.
7. Settings:
   - **DB instance identifier:** `reliefconnect-db`
   - **Master username:** `admin` (or another name, but remember it!)
   - **Master password:** Set a strong password and save it somewhere secure.
8. Connectivity:
   - **Public access:** Select **No** (best practice; your EC2 instance will access it internally, keeping it secure from the public internet).
   - **VPC security group:** Choose **Create new**. Name it `rds-sg`.
9. Click **Create database** at the bottom. This will take a few minutes to provision.

### 2. Note the Connection Details
Once the database status is **Available**, click on its name (`reliefconnect-db`).
Under the **Connectivity & security** tab, copy the **Endpoint** URL. It will look something like `reliefconnect-db.xyz.us-east-1.rds.amazonaws.com`.
You now have your:
- `DB_HOST` (The Endpoint)
- `DB_USER` (Master username)
- `DB_PASSWORD` (Master password)
- `DB_NAME` (We will create this shortly)

---

## Phase 2: Set Up the Server (Amazon EC2)

### 1. Launch the EC2 Instance
1. In the AWS Console, search for **EC2** and go to the dashboard.
2. Click **Launch instance**.
3. **Name:** `ReliefConnect-Server`.
4. **Application and OS Images (AMI):** Select **Ubuntu** (Ubuntu Server 24.04 or 22.04 LTS).
5. **Instance type:** `t2.micro` (Free tier) or `t3.small` (Recommended for Next.js builds).
6. **Key pair (login):** 
   - Click **Create new key pair**.
   - Name it `reliefconnect-key`.
   - Select **RSA** and **.pem**. Click Create. **Download and keep this file safe—you need it to SSH into the server.**
7. **Network settings:**
   - Check **Allow SSH traffic from Anywhwere** (or ideally your specific IP).
   - Check **Allow HTTP traffic from the internet**.
   - Check **Allow HTTPS traffic from the internet**.
8. Click **Launch instance**.

### 2. Allow EC2 to Talk to RDS
Because we set RDS Public Access to "No", we must explicitly allow our EC2 instance to talk to the database.
1. Go to your **EC2 Dashboard** -> **Instances** -> Click `ReliefConnect-Server`.
2. Open the **Security** tab and click on its **Security group** link. Copy the Security Group ID (e.g., `sg-0abc123...`).
3. Now go back to **RDS** -> **Databases** -> Click `reliefconnect-db`.
4. Under **Security group rules**, click the active security group (`rds-sg`).
5. Click **Edit inbound rules**.
6. Add a rule:
   - **Type:** MySQL/Aurora (Port 3306)
   - **Source:** Custom -> Paste the EC2 Security Group ID (`sg-0abc123...`) here.
7. Save rules. Your EC2 instance can now securely access the RDS database!

---

## Phase 3: Prepare the EC2 Environment

### 1. Connect to EC2
Open your terminal on your local machine and use the `.pem` file you downloaded to connect.
```bash
# First restrict permissions on the key (Windows users can skip/do this via properties)
chmod 400 reliefconnect-key.pem 

# Connect via SSH (replace with your EC2 Public IPv4 address)
ssh -i /path/to/reliefconnect-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 2. Install Required Software (Node.js, NPM, Git, MySQL Client, PM2, NGINX)
Once inside the EC2 terminal, run these commands:
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (Version 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git and MySQL Client (to create the initial database manually)
sudo apt install git mysql-client-core-8.0 -y

# Install PM2 (Process Manager to keep app running in background)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy for port 80 routing)
sudo apt install nginx -y
```

---

## Phase 4: Deploy Your Application

### 1. Clone the Repository
Generate an SSH key on your EC2 instance (`ssh-keygen`), add the public key to your GitHub account (Settings -> SSH and GPG keys), and clone your private repo:
```bash
git clone git@github.com:YOUR_GITHUB_USERNAME/ReliefConnect.git
cd ReliefConnect
```

### 2. Initialize the Database
While inside EC2, use the MySQL client to connect to your RDS instance and create the database schema:
```bash
mysql -h YOUR_RDS_ENDPOINT -u admin -p
# Enter your master password when prompted
```
Inside the MySQL shell:
```sql
CREATE DATABASE reliefconnect;
EXIT;
```

### 3. Setup and Run the Backend
```bash
cd server/
npm install

# Create your .env file
nano .env
```
Inside nano, add your production database credentials. *Press `Ctrl+X`, then `Y`, then `Enter` to save.*
```env
PORT=5000
DB_HOST=YOUR_RDS_ENDPOINT
DB_USER=admin
DB_PASSWORD=your_master_password
DB_NAME=reliefconnect
JWT_SECRET=your_super_secret_jwt_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_s3_bucket_name
```
Start the backend with PM2:
```bash
pm2 start server.js --name "reliefconnect-api"
```

### 4. Setup and Run the Frontend (Next.js)
```bash
cd ../frontend/
npm install

# Create frontend env file
nano .env.local
```
Inside nano, point your API URL to the server (you will use your domain or EC2 Public IP):
```env
NEXT_PUBLIC_API_URL=/api
```
Build and start the Next.js app:
```bash
npm run build
pm2 start npm --name "reliefconnect-ui" -- start
```

### 5. Finalize PM2 Setup
Ensure your apps restart automatically if the server reboots:
```bash
pm2 startup ubuntu
pm2 save
```

---

## Phase 5: Expose via NGINX (Reverse Proxy)

Currently, your Next.js app is on port 3000 and the API is on 5000. Nginx will route regular web traffic (Port 80) to these ports.

1. Open the Nginx default configuration:
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/reliefconnect
```
2. Add this block:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP_OR_DOMAIN; 

    # Route /api/ requests to the Node.js backend on port 5000
    location /api/ {
        proxy_pass http://localhost:5000/; # Notice the trailing slash removes /api from the forwarded url
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Route everything else to the Next.js frontend on port 3000
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
3. Enable the site, test, and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/reliefconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

🎉 **Congratulations!**
If you open `http://YOUR_EC2_PUBLIC_IP` in your browser, you should now see the ReliefConnect application!
