import { Sparkles } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Kiddy-Mate</span>
            </div>
            <p className="text-gray-400 mb-4">
              Giúp việc nuôi dạy con nhẹ nhàng hơn và tuổi thơ vui hơn nhờ trải nghiệm trò chơi hóa.
            </p>
            <div className="flex gap-3">
              {/* Social Icons placeholder */}
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <span className="text-xs">FB</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <span className="text-xs">TW</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <span className="text-xs">IG</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white mb-4">Sản phẩm</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Tính năng</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Lộ trình</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4">Công ty</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-white mb-4">Tài nguyên</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách riêng tư</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tài liệu API</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2025 Kiddy-Mate. Bảo lưu mọi quyền. Được tạo ra với ❤️ dành cho mọi gia đình.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
