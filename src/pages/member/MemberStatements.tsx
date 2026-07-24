import { FileText, Download } from 'lucide-react';

export function MemberStatements() {
  return (
    <div className="flex-1 overflow-y-auto bg-ivory-50">
      <header className="bg-white border-b border-ink-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-seed-950">Statements</h1>
          <p className="text-ink-600 mt-1">View and download your account statements.</p>
        </div>
      </header>
      <div className="p-8 max-w-4xl">
        <div className="bg-white rounded-[14px] border border-ink-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-ink-100">
            {[1, 2, 3].map((month) => {
              const date = new Date(new Date().getFullYear(), new Date().getMonth() - month, 1);
              return (
                <div key={month} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-ink-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[8px] bg-seed-50 flex items-center justify-center text-seed-700">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-seed-950">Account Statement - {date.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                      <p className="text-sm text-ink-500">PDF Document</p>
                    </div>
                  </div>
                  <button className="text-seed-700 hover:text-seed-800 font-medium text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-seed-50 transition-colors w-fit">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
