import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appointmentsService } from '../services/appointments';
import type { AppointmentDetail } from '../services/appointments';
import { authService } from '../services/auth';

export default function Appointments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookingCodeFromUrl = searchParams.get('bookingcode') || '';
  const [bookingCode, setBookingCode] = useState(bookingCodeFromUrl);
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Kiểm tra authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // Giữ bookingcode trong URL khi redirect đến login
      const loginUrl = bookingCodeFromUrl 
        ? `/login?bookingcode=${bookingCodeFromUrl}`
        : '/login';
      navigate(loginUrl);
      return;
    }
  }, [navigate, bookingCodeFromUrl]);

  // Tự động load khi có bookingcode trong URL
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      return;
    }

    // Nếu có bookingcode trong URL, tự động search
    if (bookingCodeFromUrl) {
      setBookingCode(bookingCodeFromUrl);
      handleSearchWithCode(bookingCodeFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingCodeFromUrl]);

  const handleSearchWithCode = async (code: string) => {
    if (!code.trim()) {
      setError('Vui lòng nhập mã đặt chỗ');
      return;
    }

    setError('');
    setLoading(true);
    setAppointment(null);

    try {
      const response = await appointmentsService.getAppointmentByBookingCode(
        code.trim(),
        true
      );
      
      if (response.success && response.data) {
        setAppointment(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy đơn hàng với mã đặt chỗ này. Vui lòng kiểm tra lại.');
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const code = bookingCode.trim();
    if (!code) {
      setError('Vui lòng nhập mã đặt chỗ');
      return;
    }

    // Cập nhật URL với query parameter (điều này sẽ trigger useEffect tự động)
    setSearchParams({ bookingcode: code });
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Tra cứu đơn hàng</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Đăng xuất
            </button>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập mã đặt chỗ (ví dụ: APT202511059EBECE8B)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {appointment && (
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Mã đặt chỗ: {appointment.booking_code}
                </h2>
                <p className="text-gray-600">ID: {appointment.id}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(appointment.priority)}`}>
                  {appointment.priority}
                </span>
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Thông tin lịch hẹn</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Ngày đặt lịch</p>
                    <p className="font-medium text-gray-800">{formatDate(appointment.scheduled_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-medium text-gray-800">{formatDate(appointment.created_at)}</p>
                  </div>
                  {appointment.updated_at && (
                    <div>
                      <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                      <p className="font-medium text-gray-800">{formatDate(appointment.updated_at)}</p>
                    </div>
                  )}
                  {appointment.notes && (
                    <div>
                      <p className="text-sm text-gray-500">Ghi chú</p>
                      <p className="font-medium text-gray-800">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin khách hàng */}
              {appointment.user && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Thông tin khách hàng</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Họ tên</p>
                      <p className="font-medium text-gray-800">{appointment.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{appointment.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium text-gray-800">{appointment.user.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Thông tin xe */}
            {appointment.vehicle && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Thông tin xe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4">
                    {appointment.vehicle.image_url && (
                      <img
                        src={appointment.vehicle.image_url}
                        alt={appointment.vehicle.model_name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{appointment.vehicle.brand_name} {appointment.vehicle.model_name}</p>
                      <p className="text-sm text-gray-600">Biển số: {appointment.vehicle.license_plate}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Số khung (VIN)</p>
                      <p className="font-medium text-gray-800">{appointment.vehicle.vin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số km hiện tại</p>
                      <p className="font-medium text-gray-800">{appointment.vehicle.current_mileage.toLocaleString('vi-VN')} km</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin trung tâm dịch vụ */}
            {appointment.service_center && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Trung tâm dịch vụ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tên trung tâm</p>
                    <p className="font-medium text-gray-800">{appointment.service_center.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{appointment.service_center.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium text-gray-800">{appointment.service_center.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Điện thoại</p>
                    <p className="font-medium text-gray-800">{appointment.service_center.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{appointment.service_center.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Đánh giá</p>
                    <p className="font-medium text-gray-800">{appointment.service_center.rating} ⭐</p>
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin kỹ thuật viên */}
            {appointment.technician && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Kỹ thuật viên</h3>
                <div className="flex items-center gap-4">
                  {appointment.technician.avatar_url && (
                    <img
                      src={appointment.technician.avatar_url}
                      alt={appointment.technician.name}
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div>
                      <p className="text-sm text-gray-500">Họ tên</p>
                      <p className="font-medium text-gray-800">{appointment.technician.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Chuyên môn</p>
                      <p className="font-medium text-gray-800">{appointment.technician.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{appointment.technician.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Kinh nghiệm</p>
                      <p className="font-medium text-gray-800">{appointment.technician.year_of_experience} năm</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danh sách dịch vụ */}
            {appointment.appointment_services && appointment.appointment_services.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Dịch vụ đã đặt</h3>
                <div className="space-y-4">
                  {appointment.appointment_services.map((appointmentService) => (
                    <div
                      key={appointmentService.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-800">{appointmentService.service.name}</p>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {appointmentService.service.code}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{appointmentService.service.description}</p>
                          <p className="text-xs text-gray-500">Danh mục: {appointmentService.service.category}</p>
                          {appointmentService.notes && (
                            <p className="text-sm text-gray-700 mt-2 italic">Ghi chú: {appointmentService.notes}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-500">Giá dự kiến</p>
                          <p className="text-lg font-bold text-indigo-600">
                            {formatCurrency(appointmentService.estimated_price)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Giá gốc: {formatCurrency(appointmentService.service.base_price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold text-gray-800">Tổng cộng:</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(
                          appointment.appointment_services
                            .reduce((sum, service) => sum + parseFloat(service.estimated_price), 0)
                            .toString()
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
