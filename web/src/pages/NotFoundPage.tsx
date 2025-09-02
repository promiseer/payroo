import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
          <Button 
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
