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
          required: ["categoryId", "companyId", "issueType", "contactName", "contactPhone", "lat", "lng"],
          properties: {
            categoryId: { type: "string", example: "694172f653474057be6a91f9" },
            companyId: { type: "string", example: "693d8fc1c7ea540a307ca95e" },

            issueType: { type: "string", example: "Hết xăng" },
            note: { type: "string", example: "Xe máy hết xăng, cần hỗ trợ" },
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
            assignedCompanyId: { type: "string", example: "693d8fc1c7ea540a307ca95e" },
            categoryId: { type: "string", example: "694172f653474057be6a91f9" },
            quotedBasePrice: { type: "number", example: 80000 },
            createdAt: { type: "string", example: "2025-12-13T12:00:00.000Z" },
          },
        },
        CategoryItem: {
          type: "object",
          properties: {
            id: { type: "string", example: "65f0c..." },
            key: { type: "string", example: "FUEL" },
            name: { type: "string", example: "Cứu hộ hết xăng" },
            description: { type: "string", example: "Tiếp nhiên liệu tại chỗ" },
          },
        },

        CategoryListResponse: {
          type: "object",
          properties: {
            count: { type: "number", example: 5 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CategoryItem" },
            },
          },
        },
        CompanyServiceInput: {
          type: "object",
          required: ["categoryId", "basePrice"],
          properties: {
            categoryId: { type: "string", example: "65f0c..." },
            basePrice: { type: "number", example: 80000 },
          },
        },

        UpdateCompanyProfileRequest: {
          type: "object",
          required: ["lat", "lng", "services"],
          properties: {
            lat: { type: "number", example: 21.028 },
            lng: { type: "number", example: 105.834 },
            services: {
              type: "array",
              items: { $ref: "#/components/schemas/CompanyServiceInput" },
            },
          },
        },

        UpdateCompanyProfileResponse: {
          type: "object",
          properties: {
            id: { type: "string", example: "693d..." },
            companyLocation: {
              type: "object",
              properties: {
                lat: { type: "number", example: 21.028 },
                lng: { type: "number", example: 105.834 },
              },
            },
            companyServices: {
              type: "array",
              items: { $ref: "#/components/schemas/CompanyServiceInput" },
            },
            updatedAt: { type: "string", example: "2025-12-16T12:00:00.000Z" },
          },
        },
        CompanySuggestItem: {
          type: "object",
          properties: {
            id: { type: "string", example: "693d..." },
            companyName: { type: "string", example: "Cứu hộ ABC" },
            phone: { type: "string", example: "0911111111" },
            distanceKm: { type: "number", example: 2.35 },
            basePrice: { type: "number", example: 80000 },
            location: {
              type: "object",
              properties: {
                lat: { type: "number", example: 21.028 },
                lng: { type: "number", example: 105.834 },
              },
            },
          },
        },

        CompanySuggestResponse: {
          type: "object",
          properties: {
            count: { type: "number", example: 1 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CompanySuggestItem" },
            },
          },
        },
        MyRequestListItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            status: { type: "string", example: "ASSIGNED" },
            categoryId: { type: "string" },
            assignedCompanyId: { type: "string" },
            quotedBasePrice: { type: "number", example: 80000 },
            etaMinutes: { type: "number", nullable: true, example: 15 },
            issueType: { type: "string", example: "Hết xăng" },
            addressText: { type: "string", example: "Gần Hồ Gươm" },
            createdAt: { type: "string" },
          },
        },

        MyRequestListResponse: {
          type: "object",
          properties: {
            count: { type: "number", example: 1 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/MyRequestListItem" },
            },
          },
        },

        MyRequestDetailResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            status: { type: "string", example: "ASSIGNED" },
            category: {
              type: "object",
              properties: {
                id: { type: "string" },
                key: { type: "string", example: "FUEL" },
                name: { type: "string", example: "Cứu hộ hết xăng" },
              },
            },
            company: {
              type: "object",
              properties: {
                id: { type: "string" },
                companyName: { type: "string", example: "Cứu hộ ABC" },
                phone: { type: "string", example: "0911111111" },
                companyStatus: { type: "string", example: "ACTIVE" },
              },
            },
            quotedBasePrice: { type: "number", example: 80000 },
            etaMinutes: { type: "number", nullable: true, example: 15 },
            issueType: { type: "string", example: "Hết xăng" },
            note: { type: "string", nullable: true },
            contactName: { type: "string" },
            contactPhone: { type: "string" },
            addressText: { type: "string", nullable: true },
            location: {
              type: "object",
              nullable: true,
              properties: {
                lat: { type: "number" },
                lng: { type: "number" },
              },
            },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
            completedAt: { type: "string", nullable: true, example: "2025-12-18T10:00:00.000Z" },
            customerConfirmedAt: { type: "string", nullable: true, example: "2025-12-18T10:05:00.000Z" },
            customerRating: { type: "number", nullable: true, example: 5 },
            customerReview: { type: "string", nullable: true, example: "Đến nhanh, hỗ trợ tốt" },

            cancelReason: { type: "string", nullable: true, example: "Tôi đã tự xử lý được" },
            cancelledAt: { type: "string", nullable: true, example: "2025-12-18T10:05:00.000Z" },
            cancelledBy: { type: "string", nullable: true, example: "CUSTOMER" },


          },
        },

      },
    },
  },

  // Quan trọng: dùng process.cwd() để quét đúng trong Docker
  apis: [path.join(process.cwd(), "src/modules/**/*.routes.ts")],
});
