/**
 * 🎻 Détaché - API Client
 * Centralized communication with Django (GraphQL) and Evolution API (REST).
 */

const DJANGO_URL = process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000';
const GRAPHQL_ENDPOINT = `${DJANGO_URL}/graphql/`;
const EVOLUTION_API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || '';
const EVOLUTION_API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || '';

export const apiClient = {
  /**
   * GraphQL Helper
   */
  async graphql(query: string, variables: any = {}) {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }
    return result.data;
  },

  /**
   * Evolution API Helper (WhatsApp)
   */
  async evolution(endpoint: string, method: string = 'GET', body: any = null) {
    if (!EVOLUTION_API_URL) throw new Error('Evolution API URL not configured');

    const response = await fetch(`${EVOLUTION_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
      body: body ? JSON.stringify(body) : null,
    });

    return response.json();
  },

  /**
   * Direct REST Helper for Django (if needed for file uploads, etc.)
   */
  async rest(endpoint: string, method: string = 'GET', body: any = null) {
    const response = await fetch(`${DJANGO_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });

    return response.json();
  }
};
