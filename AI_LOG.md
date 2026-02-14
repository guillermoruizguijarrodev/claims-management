# AI Usage & Supervision Log

This document details the methodology used to integrate Artificial Intelligence tools (Gemini Pro and GitHub Copilot) into the development lifecycle of the **Claims Management System**. The focus was not merely on code generation, but on architectural guidance, strict testing coverage, and reactive frontend logic supervision.

## 1. Contextualizing Gemini Pro (Prompt Engineering)
To ensure high-quality output, Gemini Pro was not treated as a simple code generator but as a specialized "Pair Programmer." 
* **Role Definition:** The LLM was prompted with a specific persona: *"You are a Senior NestJS and Angular Architect strict with TypeScript typing and SOLID principles."*
* **Context Injection:** Before generating any code, the full project structure and architectural constraints were provided. This ensured that generated snippets respected the existing dependency injection patterns and file organization.

## 2. API-First Design & SSOT (Single Source of Truth)
Adhering to the **Single Source of Truth (SSOT)** principle, the development started with the definition of the API contract.
* **OpenAPI:** AI tools assisted in drafting the `.yaml` specification for the Claims API.
* **Validation:** Gemini was used to validate the RESTful compliance of the endpoints (POST, GET, PATCH) and ensure correct data types in the DTO definitions.
* **Code Generation:** This YAML file served as the foundation to generate the TypeScript interfaces (`CreateClaimDto`, `UpdateClaimRequest`) used throughout the backend and frontend, minimizing type mismatch errors.

## 3. MongoDB Schema & Business Logic Definition
Once the contract was defined, AI was leveraged to bridge the gap between the DTOs and the Database persistence layer.
* **Schema Creation:** Mongoose schemas were generated based on the OpenAPI definitions.
* **Business Logic Injection:** Complex business rules were defined via prompts, such as:
    * *Pre-save hooks:* Automatically calculating `totalAmount` by summing the `damages` array before saving to the DB.
    * *Validation Rules:* Ensuring strict validation for specific fields (e.g., ID formats, severity levels).
* **Supervision:** Manual review was required to ensure Mongoose middleware (hooks) correctly called `next()` to avoid request hanging.

## 4. Unit Testing Strategy & High Coverage (>95%)
A rigorous testing strategy was implemented to achieve >95% code coverage.
* **Test Generation:** Gemini Pro generated the initial scaffolding for `.spec.ts` files, including Jest mocks for Mongoose Models and Services.
* **Human Correction & Refinement:**
    * **Coverage Auditing:** Initial reports showed discrepancies (e.g., testing the test files themselves). We manually configured `jest.config.js` and `collectCoverageFrom` to exclude `.spec.ts` files and focus on production code.
    * **Integration Tests:** To validate the interaction with the database (specifically the `pre-save` hooks), an in-memory MongoDB instance (`mongodb-memory-server`) was implemented manually, as unit mocks could not validate the database trigger logic.

## 5. Frontend Reactive Logic (Signals)
For the Frontend, the focus was on modern reactivity using **Signals**.
* **Implementation:** AI suggested the conversion of traditional RxJS Observables to Signals for local component state management, improving change detection performance.
* **Supervision:**
    * We monitored the code to prevent "effect loops" (circular dependencies in signals).
    * Ensured that derived state (computed signals) was used effectively to avoid manual recalculations, keeping the UI automatically in sync with the data model.

## 6. Iterative Refinement & Design Patterns (GitHub Copilot)
GitHub Copilot was used as an in-editor assistant for real-time code quality improvements.
* **Clean Code & DRY:** Copilot suggested refactoring repetitive logic into private helper methods.
* **Design Pattern Implementation (Strategy Pattern):**
    * To address the requirement of applying a design pattern to business logic, we refactored the complex validation rules in `ClaimsService`.
    * We moved from clasic `if/else` statements to the **Strategy Pattern**. Validation rules (e.g., "High Severity Description Check") were encapsulated in separate strategy classes, making the service open for extension but closed for modification (OCP).

---
**Summary:** AI accelerated the boilerplate and test generation, but **human supervision was critical** for architectural decisions, fixing complex mocking scenarios, and ensuring the final codebase met the strict quality standards (97%+ coverage achieved).