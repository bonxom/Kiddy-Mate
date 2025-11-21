import { Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Mother of 2',
      avatar: 'S',
      avatarGradient: 'bg-linear-to-br from-pink-500 to-rose-600',
      rating: 5,
      text: 'Game changer! My kids actually ASK to do their chores now. The coin system is pure magic! ✨',
    },
    {
      name: 'John Davis',
      role: 'Father of 3',
      avatar: 'J',
      avatarGradient: 'bg-linear-to-br from-blue-500 to-indigo-600',
      rating: 5,
      text: 'Finally, a solution that works! The dashboard helps me see which child needs more encouragement.',
    },
    {
      name: 'Lisa Chen',
      role: 'Mother of 1',
      avatar: 'L',
      avatarGradient: 'bg-linear-to-br from-purple-500 to-violet-600',
      rating: 5,
      text: 'The emotion tracking feature is brilliant. I can tell when my son is stressed and adjust tasks accordingly.',
    },
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-amber-50 via-orange-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="success" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            What Parents Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of happy families already using Kiddy-Mate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              padding="lg" 
              hover
              className="animate-fade-in bg-white/80 backdrop-blur-sm"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${testimonial.avatarGradient} flex items-center justify-center text-white font-bold text-lg shadow-medium`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
