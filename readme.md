## 🔄 App Flow

1. **User Registration**
   - User registers with `username`, `email`, and `password`.

2. **Authentication**
   - On login, JWT token is generated and stored on the client.

3. **Task Management**
   - Authenticated users can:
     - Create new tasks
     - View their tasks
     - Update or delete tasks
     - Task Filtering
     - Task Search
     - Export csv

     

4. **Frontend**
   - The frontend is built with Next.js and uses API calls to the backend.
   - User must be logged in to access the dashboard.


## How to run backend 
    first you have to go to backend folder cd backend/
    - without docker 
        you can install npm by npm i and run by npm run dev
    - with docker
        run compose-docker up --build

## How to run frontend 
    first you have to go to backend folder cd frontend/

    end points
    http://localhost:3000/auth/register
    http://localhost:3000/auth/register   
    http://localhost:3000/dashboard
    

    - without docker
        you can install npm by npm i --legacy-peer-deps and run npm run dev
    -with docker
        run compose-docker up --build
