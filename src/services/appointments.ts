import { api } from './api';

export interface Appointment {
  id: number;
  booking_code: string;
  vehicle_id: number;
  service_center_id: number;
  technician_id: number;
  user_id: number;
  scheduled_date: string;
  priority: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface Service {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  base_price: string;
}

export interface AppointmentService {
  id: number;
  appointment_id: number;
  service_id: number;
  estimated_price: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  service: Service;
}

export interface Vehicle {
  id: number;
  user_id: number;
  vin: string;
  license_plate: string;
  model_id: number;
  current_mileage: number;
  warranty_end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  model_name: string;
  brand_name: string;
  image_url: string;
  images: {
    primary_url: string;
  };
}

export interface ServiceCenter {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  rating: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Technician {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  year_of_experience: number;
  avatar_url: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
}

export interface AppointmentDetail extends Appointment {
  appointment_services: AppointmentService[];
  vehicle: Vehicle;
  service_center: ServiceCenter;
  technician: Technician;
  user: User;
}

export interface AppointmentDetailResponse {
  success: boolean;
  message: string;
  data: AppointmentDetail;
}

export interface AppointmentsResponse {
  success: boolean;
  message: string;
  data: Appointment[];
}

export interface AppointmentsParams {
  skip?: number;
  limit?: number;
  status?: string;
  service_center_id?: number;
  vehicle_id?: number;
  start_date?: string;
  end_date?: string;
  booking_code?: string;
  include_services?: boolean;
}

export const appointmentsService = {
  getAppointmentByBookingCode: async (
    bookingCode: string,
    includeServices: boolean = true
  ): Promise<AppointmentDetailResponse> => {
    const response = await api.get<AppointmentDetailResponse>(
      `/appointments/booking/${bookingCode}`,
      {
        params: {
          include_services: includeServices,
        },
      }
    );
    return response.data;
  },

  getAppointments: async (params?: AppointmentsParams): Promise<AppointmentsResponse> => {
    const response = await api.get<AppointmentsResponse>('/appointments/', {
      params,
    });
    return response.data;
  },
};
