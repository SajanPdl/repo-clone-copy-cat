interface AdPlacementProps {
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  className?: string;
}

const AdPlacement = ({ position, className = '' }: AdPlacementProps) => {
  const getAdContent = () => {
    switch (position) {
      case 'top':
        return {
          title: '📚 Premium Study Materials',
          description: 'Get access to exclusive study guides and practice tests',
          cta: 'Upgrade Now'
        };
      case 'middle':
        return {
          title: '🎯 Ace Your Exams',
          description: 'Join thousands of students who improved their grades',
          cta: 'Learn More'
        };
      case 'bottom':
        return {
          title: '📱 Download Our App',
          description: 'Study on the go with our mobile application',
          cta: 'Download'
        };
      case 'sidebar':
        return {
          title: '🔥 Trending Now',
          description: 'Most downloaded study materials this week',
          cta: 'View All'
        };
      default:
        return {
          title: 'Study Smart',
          description: 'Improve your academic performance',
          cta: 'Learn More'
        };
    }
  };

  const adContent = getAdContent();

  return (
    <div className={`bg-gradient-to-r from-edu-purple/10 to-edu-blue/10 border border-edu-purple/20 rounded-lg p-4 ${className}`}>
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {adContent.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {adContent.description}
        </p>
        <button className="bg-gradient-to-r from-edu-purple to-edu-blue text-white px-4 py-2 rounded-md text-sm hover:opacity-90 transition-opacity">
          {adContent.cta}
        </button>
      </div>
    </div>
  );
};

export default AdPlacement;