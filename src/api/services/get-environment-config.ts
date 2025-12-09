import type { Environment } from "../../types/env.types";
import { apiClient } from "../axios/axios-instance";

export const getEnvironment = async (): Promise<Environment> => {

    try {
        const response = await apiClient.get<Environment>("/retreever/environment");

        if(response.status === 200) {
            return response.data;
        }

        throw new Error(
        `Failed to fetch Retreever Environment Config | status: ${response.status}`
        );
    } catch (error) {
    throw new Error(
      `Failed to fetch Retreever Environment Config: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}