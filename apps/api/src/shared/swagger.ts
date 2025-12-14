import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rescue System API",
      version: "0.1.0",
    },
    servers: [{ url: "http://localhost:4000" }],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Invalid email or password" },
          },
        },

        UserPublic: {
          type: "object",
          properties: {
            id: { type: "string", example: "693d8f92c7ea540a307ca95a" },
            email: { type: "string", example: "customer1@gmail.com" },
            role: { type: "string", enum: ["CUSTOMER", "COMPANY", "ADMIN"], example: "CUSTOMER" },
            name: { type: "string", example: "Khách 1" },
            phone: { type: "string", example: "0900000000" },
            companyName: { type: "string", example: "Cứu hộ ABC", nullable: true },
            companyStatus: {
              type: "string",
              enum: ["PENDING", "ACTIVE", "REJECTED"],
              example: "PENDING",
              nullable: true,
            },
            createdAt: { type: "string", example: "2025-12-13T12:00:00.000Z" },
          },
        },

        RegisterRequest: {
          type: "object",
          required: ["email", "password", "role", "name"],
          properties: {
            email: { type: "string", example: "user@gmail.com" },
            password: { type: "string", example: "123456" },
            role: { type: "string", enum: ["CUSTOMER", "COMPANY"], example: "CUSTOMER" },
            name: { type: "string", example: "Nguyễn Văn A" },
            phone: { type: "string", example: "0900000000" },
            companyName: { type: "string", example: "Cứu hộ ABC" },
          },
        },

        RegisterResponse: {
          type: "object",
          properties: {
            id: { type: "string", example: "693d8f92c7ea540a307ca95a" },
            email: { type: "string", example: "user@gmail.com" },
            role: { type: "string", enum: ["CUSTOMER", "COMPANY"], example: "CUSTOMER" },
            name: { type: "string", example: "Nguyễn Văn A" },
            phone: { type: "string", example: "0900000000" },
            companyName: { type: "string", nullable: true, example: "Cứu hộ ABC" },
            companyStatus: {
              type: "string",
              enum: ["PENDING", "ACTIVE", "REJECTED"],
              nullable: true,
              example: "PENDING",
            },
            createdAt: { type: "string", example: "2025-12-13T12:00:00.000Z" },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "customer1@gmail.com" },
            password: { type: "string", example: "123456" },
          },
        },

        LoginResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: { $ref: "#/components/schemas/UserPublic" },
          },
        },
        CompanyListResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "PENDING" },
            count: { type: "number", example: 1 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/UserPublic" },
            },
          },
        },

        UpdateCompanyStatusRequest: {
          type: "object",
          required: ["companyStatus"],
          properties: {
            companyStatus: { type: "string", enum: ["ACTIVE", "REJECTED"], example: "ACTIVE" },
          },
        },
        PingResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: true },
            message: { type: "string", example: "company active" },
          },
        },
        CreateRescueRequest: {
          type: "object",
          required: ["issueType", "contactName", "contactPhone", "lat", "lng"],
          properties: {
            issueType: { type: "string", example: "Thủng lốp" },
            note: { type: "string", example: "Đang đứng ở lề phải" },
            contactName: { type: "string", example: "Khách 1" },
            contactPhone: { type: "string", example: "0900000000" },
            lat: { type: "number", example: 21.028 },
            lng: { type: "number", example: 105.834 },
            addressText: { type: "string", example: "Gần Hồ Gươm, Hà Nội" },
          },
        },

        RescueRequestResponse: {
          type: "object",
          properties: {
            id: { type: "string", example: "693d9abc123..." },
            status: { type: "string", example: "PENDING" },
            issueType: { type: "string", example: "Thủng lốp" },
            note: { type: "string", example: "Đang đứng ở lề phải" },
            contactName: { type: "string", example: "Khách 1" },
            contactPhone: { type: "string", example: "0900000000" },
            addressText: { type: "string", example: "Gần Hồ Gươm, Hà Nội" },
            location: {
              type: "object",
              properties: {
                lat: { type: "number", example: 21.028 },
                lng: { type: "number", example: 105.834 },
              },
            },
            createdAt: { type: "string", example: "2025-12-13T12:00:00.000Z" },
          },
        },

      },
    },
  },

  // Quan trọng: dùng process.cwd() để quét đúng trong Docker
  apis: [path.join(process.cwd(), "src/modules/**/*.routes.ts")],
});
