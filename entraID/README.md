Instructions for using EntraID as Identity and Authentication Management service
0. Requirements
Webapp to use EntraID for authentication
    ```bash
   sudo apt update
   sudo apt install -y nodejs npm

Create a project directory:
    ```bash

    mkdir -p my-webapp
    cd my-webapp
    npm init -y
    npm install express axios cookie-parser dotenv

    Create files:
        server.js
        .env
        package.json (already created)


1. Sign up for Entra ID or Azure products. Use Azure free Account 90 days trial. (Student does not provide EntraID)
   - 
   - Create Tenant and users: 
2. Create simple Webapp 
    -
    - fill .env with tennant/client id, redirect_uri and Client secret (next step)
    - Register the app in entraID -> new registration (single tennant, App ID (Client), Directory ID (Tenant)
    - In App Registration: Certificates & Secrets -> New Client secret (Will transition to Certificates later) -> copy value into .env
    
Create server.js with routes:

    /login (starts auth request)
    /auth/callback (handles redirect with code/state)
    /me (shows basic info)

You should generate and store:

    state (random, stored temporarily in a cookie or session)
    code_verifier only if using PKCE (optional for week 1)

Minimal flow:

    /login -> redirect to Microsoft authorize endpoint with:
        client_id, redirect_uri, response_type=code, scope=openid profile email, state
    /auth/callback -> read query:
        code, state
        validate returned state matches what you sent
    exchange code at token endpoint:
        client_id, client_secret, redirect_uri, grant_type=authorization_code, code

    Use Microsoft endpoints derived from:

        authorization: https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize (common modern endpoint)
        token: https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token

3. Test the architecture step by step
    
    Use Burp or ZAP to intercept requests in browser
    console.log the request and response between /auth/callback and entraId 

X. TODOS
    - Alternative to secret + .env combo: 1. Do PKCE instead of client secret 2. do encrypted env if node module exist or make it (dotenvx?)
    - verify jwt token signature in server.json
