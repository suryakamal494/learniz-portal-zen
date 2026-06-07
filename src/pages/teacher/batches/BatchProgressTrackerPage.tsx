import { Navigate, useParams } from 'react-router-dom';

/**
 * Legacy /teacher/batches/:batchId/progress route — merged into the unified
 * Program page. Redirects to the #progress anchor so old links + voice-nav
 * still land in the right section.
 */
export default function BatchProgressTrackerPage() {
  const { batchId } = useParams<{ batchId: string }>();
  if (!batchId) return <Navigate to="/teacher/batches" replace />;
  return <Navigate to={`/teacher/batches/${batchId}/programs#progress`} replace />;
}
