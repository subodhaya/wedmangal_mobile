import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as storage from "./storage";

const API_BASE_URL = "https://wedmangal.com/api";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // ✅ Request interceptor — attach Bearer token + error handler
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await storage.getItem("accessToken");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.warn("Could not read token:", e);
        }
        console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error) // ✅ was missing before
    );

    // ✅ Response interceptor — auto refresh token on 401
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        const originalRequest = error.config as RetryableRequest;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = await storage.getItem("refreshToken");
            if (refreshToken) {
              const res = await this.client.post("/token/refresh/", { refresh: refreshToken });
              const newToken = res.data.access;
              await storage.setItem("accessToken", newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest); // retry original request
            }
          } catch {
            await storage.deleteItem("accessToken");
            await storage.deleteItem("refreshToken");
            console.error("❌ Session expired. Please log in again.");
          }
        }

        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
        console.error("Error details:", JSON.stringify(error.response?.data));
        return Promise.reject(error);
      }
    );
  }

  // ============ AUTHENTICATION ============

  async login(email: string, password: string) {
    // ✅ /api/auth/login/ — dj-rest-auth expects 'username'
    const response = await this.client.post("/auth/login/", { username: email, password });
    if (response.data.access) await storage.setItem("accessToken", response.data.access);
    if (response.data.refresh) await storage.setItem("refreshToken", response.data.refresh);
    return response;
  }

  async loginWithJWT(email: string, password: string) {
    // ✅ /api/users/login/ — Django expects 'username' field (mapped to email)
    const response = await this.client.post("/users/login/", { username: email, password });
    if (response.data.access) await storage.setItem("accessToken", response.data.access);
    if (response.data.refresh) await storage.setItem("refreshToken", response.data.refresh);
    return response;
  }

  async signup(userData: any) {
    const response = await this.client.post("/users/register/", userData);
    if (response.data.access) await storage.setItem("accessToken", response.data.access);
    if (response.data.refresh) await storage.setItem("refreshToken", response.data.refresh);
    return response;
  }

  async ownerRegister(userData: { name: string; email: string; password: string }) {
    const response = await this.client.post("/users/owner-register/", {
      ...userData,
      role: 'service-owner',
    });
    return response;
  }

  async googleLogin(token: string) {
    // ✅ /api/auth/google-login/
    const response = await this.client.post("/auth/google-login/", { token });
    if (response.data.access) await storage.setItem("accessToken", response.data.access);
    if (response.data.refresh) await storage.setItem("refreshToken", response.data.refresh);
    return response;
  }

  async refreshToken() {
    // ✅ /api/token/refresh/
    const refreshToken = await storage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token available");
    const response = await this.client.post("/token/refresh/", { refresh: refreshToken });
    if (response.data.access) await storage.setItem("accessToken", response.data.access);
    return response;
  }

  async logout() {
    // No-op — auth-context handles all token clearing
  }

  // ============ USER PROFILE ============
  // Base: /api/users/

  async getUserProfile() {
    return this.client.get("/users/profile/");
  }

  async updateUserProfile(data: any) {
    return this.client.put("/users/profile/update/", data);
  }

  async getUsers() {
    return this.client.get("/users/");
  }

  async getUserById(pk: string | number) {
    return this.client.get(`/users/${pk}/`);
  }

  async updateUser(pk: string | number, data: any) {
    return this.client.put(`/users/update/${pk}/`, data);
  }

  async deleteUser(pk: string | number) {
    return this.client.delete(`/users/delete/${pk}/`);
  }

  async saveWeddingDate(data: any) {
    return this.client.post("/users/wedding-date/", data);
  }

  async getWeddingDate(userId: string | number) {
    return this.client.get(`/users/wedding-date/${userId}/`);
  }

  async claimSendOtp(data: any) {
    return this.client.post("/users/claim/send-otp/", data);
  }

  async claimVerifyOtp(data: any) {
    return this.client.post("/users/claim/verify-otp/", data);
  }

  async getMyClaimedListings() {
    return this.client.get("/users/my-claims/");
  }

  // ============ PRODUCTS ============
  // Base: /api/products/

  async getProducts(params?: any) {
    // ✅ /api/products/all — no trailing slash
    return this.client.get("/products/all", { params });
  }

  async getTopProducts() {
    return this.client.get("/products/all/top/");
  }

  async getProductById(id: string | number) {
    return this.client.get(`/products/${id}/`);
  }

  async getProductWithRelated(pk: string | number) {
    return this.client.get(`/products/product/${pk}/`);
  }

  async getProductBusinessData(pk: string | number) {
    return this.client.get(`/products/products/${pk}/business-data/`);
  }

  async searchProducts(query: string, params?: any) {
    return this.client.get("/products/search/", {
      params: { search: query, ...params },
    });
  }

  async getAvailableToday() {
    return this.client.get("/products/available-today/");
  }

  async getRelatedServices(pk: string | number) {
    return this.client.get(`/products/services/${pk}/`);
  }

  async getMyProducts() {
    return this.client.get("/products/mine/");
  }

  async getMyBusiness(userId: string | number) {
    return this.client.get(`/products/my-business/${userId}/`);
  }

  async getProductsByUser(userId: string | number) {
    return this.client.get(`/products/by-user/${userId}/`);
  }

  async getServicesByProduct(productId: string | number) {
    return this.client.get(`/products/by-product/${productId}/`);
  }

  async createProduct(data: any) {
    return this.client.post("/products/create/", data);
  }

  async registerProduct(data: any) {
    return this.client.post("/products/register-product/", data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async registerService(data: any) {
    return this.client.post("/products/register-service/", data);
  }

  async addService(data: any) {
    return this.client.post("/products/add_service/", data);
  }

  async deleteService(serviceId: string | number) {
    return this.client.delete(`/products/delete_service/${serviceId}/`);
  }

  async updateProduct(userId: string | number, data: any) {
    return this.client.post(`/products/update_product/${userId}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async updateService(serviceId: string | number, data: any) {
    return this.client.put(`/products/update_service/${serviceId}/`, data);
  }

  async deleteProduct(pk: string | number) {
    return this.client.delete(`/products/delete/${pk}/`);
  }

  async approveProduct(pk: string | number) {
    return this.client.put(`/products/${pk}/approve/`);
  }

  async toggleAvailability(data: any) {
    return this.client.post("/products/toggle-availability/", data);
  }

  async uploadImage(formData: FormData) {
    return this.client.post("/products/upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async addServiceImages(serviceId: string | number, formData: FormData) {
    return this.client.post(`/products/${serviceId}/images/upload/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async removeBusinessImage(pk: string | number) {
    return this.client.delete(`/products/${pk}/remove-business-image/`);
  }

  async removeServiceImage(pk: string | number) {
    return this.client.delete(`/products/${pk}/remove-service-image/`);
  }

  // ============ CART & WISHLIST ============

  async syncCart(cartData: any) {
    return this.client.post("/products/cart/", cartData);
  }

  async getWishlist() {
    // ✅ /api/products/wishlist/ — requires auth token
    return this.client.get("/products/wishlist/");
  }

  async syncWishlist(wishlistData: any) {
    return this.client.post("/products/wishlist/", wishlistData);
  }

  async addToWishlist(productId: string | number) {
    return this.client.post("/products/wishlist/", { product_id: productId });
  }

  async removeFromWishlist(productId: string | number) {
    return this.client.delete(`/products/wishlist/${productId}/`);
  }

  // ============ REVIEWS ============

  async createReview(serviceId: string | number, data: any) {
    return this.client.post(`/products/${serviceId}/reviews/`, data);
  }

  // ============ BOOKINGS & APPOINTMENTS ============

  async getBookedDates(serviceId: string | number) {
    // ✅ no trailing slash — defined that way in product_urls
    return this.client.get(`/products/bookings/${serviceId}/dates`);
  }

  async getAppointmentsByProduct(productId: string | number) {
    return this.client.get(`/products/appointments/${productId}/`);
  }

  async markOrderAsDone(pk: string | number) {
    return this.client.put(`/products/appointments/${pk}/update/`);
  }

  // ============ ORDERS ============
  // ✅ Base: /api/orders/  (PLURAL — was /order/ before which was wrong)

  async getOrders() {
    return this.client.get("/orders/");
  }

  async getMyOrders() {
    // ✅ /api/orders/myorders/
    return this.client.get("/orders/myorders/");
  }

  async getOrderById(id: string | number) {
    return this.client.get(`/orders/${id}/`);
  }

  async createOrder(data: any) {
    return this.client.post("/orders/add/", data);
  }

  async updateOrderToPaid(id: string | number) {
    return this.client.put(`/orders/${id}/pay/`, {});
  }

  async updateOrderToDelivered(id: string | number) {
    return this.client.put(`/orders/${id}/deliver/`, {});
  }

  async getUnreadOrders() {
    return this.client.get("/orders/unread/");
  }

  async markOrderNotificationsRead() {
    return this.client.post("/orders/mark-read/");
  }

  async createCashfreePayment(pk: number, data?: any) {
    return this.client.post(`/orders/${pk}/create-cashfree-payment/`, data ?? {});
  }

  async getServiceAppointments(productId: string | number) {
    // ✅ /api/orders/appointments/<product_id>/
    return this.client.get(`/orders/appointments/${productId}/`);
  }

  async getBudget(pk: string | number) {
    return this.client.get(`/orders/get-budget/${pk}/`);
  }

  async updateBudget(pk: string | number, data: any) {
    return this.client.put(`/orders/update-budget/${pk}/`, data);
  }

  // ============ VENDOR CALENDAR ============

  async getVendorCalendar() {
    return this.client.get("/orders/calendar/");
  }

  async blockCalendarDate(data: any) {
    return this.client.post("/orders/calendar/block/", data);
  }

  async unblockCalendarDate(pk: number) {
    return this.client.delete(`/orders/calendar/block/${pk}/`);
  }

  // ============ BLOG ============

  async getBlogPosts(params?: { category?: string }) {
    return this.client.get("/blog/", { params });
  }

  async getBlogPost(slug: string) {
    return this.client.get(`/blog/${slug}/`);
  }
}

export const apiClient = new APIClient();
