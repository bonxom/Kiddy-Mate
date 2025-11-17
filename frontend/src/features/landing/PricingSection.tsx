import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const PricingSection = () => {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for trying out',
      features: [
        '1 child profile',
        'Basic task management',
        '10 tasks per month',
        'Simple rewards',
        'Community support',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Pro',
      price: 9,
      period: 'month',
      description: 'Most popular choice',
      features: [
        'Up to 3 children',
        'Unlimited tasks',
        'Advanced analytics',
        'Custom rewards',
        'Priority support',
        'Emotion tracking',
      ],
      cta: 'Start Pro Trial',
      popular: true,
    },
    {
      name: 'Family',
      price: 19,
      period: 'month',
      description: 'For larger families',
      features: [
        'Unlimited children',
        'Everything in Pro',
        'Family sharing',
        'Export reports',
        'API access',
        'Dedicated support',
      ],
      cta: 'Start Family Trial',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-purple-200 via-pink-200 to-orange-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="warning" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free, upgrade when you're ready. No surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              padding="lg"
              hover
              variant={plan.popular ? 'gradient' : 'default'}
              className={`relative animate-fade-in ${
                plan.popular ? 'ring-2 ring-primary-500 shadow-glow-accent' : ''
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                fullWidth
                variant={plan.popular ? 'primary' : 'outline'}
                size="lg"
                onClick={() => navigate('/register')}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
