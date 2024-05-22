# My Express App with MongoDB and Docker

This project is a simple Node.js and Express application connected to a MongoDB database. The app provides an endpoint to identify contacts by their email and phone number. This project is containerized using Docker, and the steps to build and publish the Docker image are included.
## Table of Contents

    Installation
    Configuration
    Running the Application
    Docker
        Building the Docker Image
        Running the Docker Container
        Publishing the Docker Image
    API Endpoint
    License

Installation

Clone the repository:

```bash
git clone https://github.com/your-repo/my-express-app.git
cd my-express-app
```

Install dependencies:

```bash
npm install
```

Configuration

Create a .env file in the root of the project and add your MongoDB URI:

```env
    MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority
    PORT=3000
```

## Running the Application

### Start the application:

```bash
    npm start
    The application should now be running at http://localhost:3000 
```
## Docker

### Building the Docker Image

Build the Docker image:

```bash
docker build -t contacts .
```
## Running the Docker Container

Run the Docker container:

```bash
docker run -p 3000:3000 --env-file .env contacts
```

 Publishing the Docker Image

Log in to Docker Hub:

```bash
docker login
```

Tag the Docker image:

```bash
docker tag my-express-app your-dockerhub-username/my-express-app:latest
```

Push the Docker image to Docker Hub:

```bash
    docker push your-dockerhub-username/my-express-app:latest
```
API Endpoint

Identify Contact

    URL: /identify
    Method: POST
    Content-Type: application/json
    Request Body:

```json

{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```
Response:

```json

    {
      "contact": {
        "primaryContactId": "60c72b2f9b1d8e6f8b0c5a6a",
        "emails": ["user@example.com"],
        "phoneNumbers": ["1234567890"],
        "secondaryContactIds": []
      }
    }
```
License

This project is licensed under the MIT License. See the LICENSE file for details.

Feel free to reach out if you have any questions or need further assistance. Happy coding!
