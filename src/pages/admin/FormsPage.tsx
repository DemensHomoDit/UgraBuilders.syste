import FormsManagement from '@/components/admin/FormsManagement';
import ErrorBoundary from '@/components/ErrorBoundary';
import { User } from '@/services/types/authTypes';

interface FormsPageProps {
  user: User;
}

const FormsPage: React.FC<FormsPageProps> = ({ user }) => {
  return (
    <ErrorBoundary>
      <FormsManagement />
    </ErrorBoundary>
  );
};

export default FormsPage; 