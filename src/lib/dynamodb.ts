import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "hostel-management";

// Entity Types
export enum EntityType {
  STUDENT = "STUDENT",
  ROOM = "ROOM",
  MAINTENANCE = "MAINTENANCE",
  FOOD_MENU = "FOOD_MENU",
  FOOD_ORDER = "FOOD_ORDER",
  EMERGENCY_CONTACT = "EMERGENCY_CONTACT",
  PAYMENT = "PAYMENT",
  ATTENDANCE = "ATTENDANCE",
}

// Single Table Design Structure:
// PK: EntityType#ID (e.g., STUDENT#STU001, ROOM#BRANCH-A-101)
// SK: EntityType#ID or metadata (e.g., STUDENT#STU001, MAINTENANCE#REQ001)

export interface Student {
  PK: string; // STUDENT#studentId
  SK: string; // STUDENT#studentId
  entityType: EntityType.STUDENT;
  studentId: string;
  password: string; // hashed
  name: string;
  email: string;
  phone: string;
  branch?: string;
  roomNumber?: string;
  registrationDate: string;
  feesPaid: boolean;
  active: boolean;
}

export interface Room {
  PK: string; // ROOM#branchName
  SK: string; // ROOM#roomNumber
  entityType: EntityType.ROOM;
  branch: string;
  roomNumber: string;
  capacity: number;
  occupied: number;
  students: string[]; // Array of student IDs
}

export interface MaintenanceRequest {
  PK: string; // MAINTENANCE#studentId
  SK: string; // MAINTENANCE#requestId
  entityType: EntityType.MAINTENANCE;
  requestId: string;
  studentId: string;
  studentName: string;
  branch: string;
  roomNumber: string;
  issue: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "rejected";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface FoodMenuItem {
  PK: string; // FOOD_MENU#menuId
  SK: string; // FOOD_MENU#menuId
  entityType: EntityType.FOOD_MENU;
  menuId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface FoodOrder {
  PK: string; // FOOD_ORDER#studentId
  SK: string; // FOOD_ORDER#orderId
  entityType: EntityType.FOOD_ORDER;
  orderId: string;
  studentId: string;
  studentName: string;
  items: {
    menuId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: "pending" | "preparing" | "delivered" | "cancelled";
  createdAt: string;
  deliveredAt?: string;
}

export interface EmergencyContact {
  PK: string; // EMERGENCY_CONTACT#category
  SK: string; // EMERGENCY_CONTACT#contactId
  entityType: EntityType.EMERGENCY_CONTACT;
  contactId: string;
  category: "medical" | "transport" | "security" | "other";
  name: string;
  phone: string;
  email?: string;
  description: string;
  available247: boolean;
}

export interface Payment {
  PK: string; // PAYMENT#studentId
  SK: string; // PAYMENT#paymentId
  entityType: EntityType.PAYMENT;
  paymentId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentType: "hostel-fee" | "food" | "maintenance" | "other";
  status: "pending" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
}

export interface Attendance {
  PK: string; // ATTENDANCE#studentId
  SK: string; // ATTENDANCE#date
  entityType: EntityType.ATTENDANCE;
  studentId: string;
  studentName: string;
  branch: string;
  date: string;
  present: boolean;
  checkInTime?: string;
  checkOutTime?: string;
}

// Helper functions
export const db = {
  // Generic Put
  async put(item: any) {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });
    return await docClient.send(command);
  },

  // Generic Get
  async get(PK: string, SK: string) {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
    });
    const result = await docClient.send(command);
    return result.Item;
  },

  // Generic Query
  async query(PK: string, SKPrefix?: string) {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: SKPrefix
        ? "PK = :pk AND begins_with(SK, :sk)"
        : "PK = :pk",
      ExpressionAttributeValues: SKPrefix
        ? { ":pk": PK, ":sk": SKPrefix }
        : { ":pk": PK },
    });
    const result = await docClient.send(command);
    return result.Items || [];
  },

  // Generic Update
  async update(PK: string, SK: string, updates: Record<string, any>) {
    const updateExpression = Object.keys(updates)
      .map((key, index) => `#${key} = :val${index}`)
      .join(", ");

    const expressionAttributeNames = Object.keys(updates).reduce(
      (acc, key) => {
        acc[`#${key}`] = key;
        return acc;
      },
      {} as Record<string, string>
    );

    const expressionAttributeValues = Object.keys(updates).reduce(
      (acc, key, index) => {
        acc[`:val${index}`] = updates[key];
        return acc;
      },
      {} as Record<string, any>
    );

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(command);
    return result.Attributes;
  },

  // Generic Delete
  async delete(PK: string, SK: string) {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
    });
    return await docClient.send(command);
  },

  // Scan (use sparingly)
  async scan(filterExpression?: string, expressionAttributeValues?: any) {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    });
    const result = await docClient.send(command);
    return result.Items || [];
  },

  // Scan by entity type
  async scanByType(entityType: EntityType) {
    return await this.scan("entityType = :type", { ":type": entityType });
  },
};

export default db;
