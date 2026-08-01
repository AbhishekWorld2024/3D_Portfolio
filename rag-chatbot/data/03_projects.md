# Abhishek Arugonda — Projects

## Project 01 — AI-Powered Healthcare Management System
- Engineered a full-stack healthcare platform enabling patient registration,
  appointment scheduling, and doctor management.
- Built ML models for disease prediction based on user symptoms, improving
  diagnostic-assistance workflows.
- Developed RESTful backend services using Flask to handle user data,
  appointments, and real-time interactions.
- Implemented role-based access (patients, doctors, admin) with secure session
  handling.
- Structured for scalability with a modular architecture and integration of
  multiple ML models.

**Stack:** Python, Flask, Machine Learning, MongoDB, REST APIs, JWT.

### Deep-Dive — AI Healthcare System
**Challenge:** unify traditional healthcare workflows (patient registration,
appointment scheduling, doctor management) with ML-based disease prediction in
one reliable platform. **Approach:** built RESTful Flask services with a modular
architecture so multiple ML models could be integrated and swapped
independently; enforced role-based access (patients, doctors, admin) with secure
session handling; stored records in MongoDB. **Impact:** improved
diagnostic-assistance workflows by surfacing likely conditions from user
symptoms, and the modular design made the system straightforward to extend with
new models.

## Project 02 — Full-Stack E-Commerce Platform
- Developed a full-stack e-commerce system with product catalog, cart, and order
  management.
- Built RESTful APIs for authentication, product handling, and order processing.
- Implemented secure user authentication using JWT and role-based access control.
- Designed a modular backend architecture for scalable and maintainable services.

**Stack:** ReactJS, Node.js, Express, MongoDB, JWT, REST APIs.

### Deep-Dive — E-Commerce Platform
**Challenge:** deliver a complete shopping experience (catalog, cart, orders)
with secure authentication and a maintainable codebase. **Approach:** designed a
modular backend with RESTful APIs cleanly separating authentication, product
handling, and order processing; implemented JWT-based auth with role-based access
control; built a ReactJS frontend against a Node/Express API backed by MongoDB.
**Impact:** a scalable, maintainable architecture where new features can be added
without disrupting existing services.

## Project 03 — Portfolio RAG Chatbot (this project)
Abhishek built this very portfolio chatbot using a Retrieval-Augmented
Generation (RAG) architecture: source documents about him are chunked, embedded,
and stored in a vector database, then retrieved at query time and passed to an
LLM so answers stay grounded in his real resume data rather than hallucinated.
