import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const Reports = () => {
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingPie, setLoadingPie] = useState(false);
  const [loadingBar, setLoadingBar] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const downloadFile = async (endpoint: string, filename: string, setLoading: any, mimeType?: string) => {
    setLoading(true);
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      const headers: HeadersInit = {};
      
      // Add token if available (optional for reports endpoints)
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(fullUrl, { 
        headers
      });

      if (!response.ok) {
        // Try to parse as JSON for error messages
        let errorMsg = 'Failed to download file';
        try {
          const err = await response.json();
          errorMsg = err.error || errorMsg;
        } catch {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Get the blob with proper type
      const blob = await response.blob();
      
      // Create download link
      const link = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`${filename} downloaded successfully`);
    } catch (err) {
      console.error(err);
      toast.error('Error downloading file');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Export tasks and conflict reports separately (CSV + charts)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Download CSV
              </CardTitle>
              <CardDescription className="mt-2">
                Download all tasks and conflicts as CSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => downloadFile('/api/reports/export/csv', 'task_conflict_report.csv', setLoadingCSV, 'text/csv')}
                disabled={loadingCSV}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Download className={`h-4 w-4 mr-2 ${loadingCSV ? 'animate-bounce' : ''}`} />
                {loadingCSV ? 'Downloading...' : 'Download CSV'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Download Pie Chart
              </CardTitle>
              <CardDescription className="mt-2">
                Download pie chart showing conflict types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => downloadFile('/api/reports/export/pie', 'conflict_types_pie.png', setLoadingPie, 'image/png')}
                disabled={loadingPie}
                className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
              >
                <Download className={`h-4 w-4 mr-2 ${loadingPie ? 'animate-bounce' : ''}`} />
                {loadingPie ? 'Downloading...' : 'Download Pie Chart'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Download Bar Chart
              </CardTitle>
              <CardDescription className="mt-2">
                Download bar chart showing conflicts per task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => downloadFile('/api/reports/export/bar', 'conflicts_per_task_bar.png', setLoadingBar, 'image/png')}
                disabled={loadingBar}
                className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:opacity-90"
              >
                <Download className={`h-4 w-4 mr-2 ${loadingBar ? 'animate-bounce' : ''}`} />
                {loadingBar ? 'Downloading...' : 'Download Bar Chart'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Download Full Report (PDF)
              </CardTitle>
              <CardDescription className="mt-2">
                Download comprehensive PDF report with all tasks, conflicts, and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => downloadFile('/api/reports/export/pdf', 'conflict_detection_full_report.pdf', setLoadingPDF, 'application/pdf')}
                disabled={loadingPDF}
                className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:opacity-90"
              >
                <Download className={`h-4 w-4 mr-2 ${loadingPDF ? 'animate-bounce' : ''}`} />
                {loadingPDF ? 'Downloading...' : 'Download Full Report (PDF)'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
