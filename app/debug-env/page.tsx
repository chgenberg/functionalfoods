'use client';

export default function DebugEnv() {
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Environment Debug</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <h2 className="font-semibold">Stripe Publishable Key:</h2>
            <p className="text-sm font-mono break-all">
              {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '❌ UNDEFINED'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded">
            <h2 className="font-semibold">Node Environment:</h2>
            <p className="text-sm font-mono">
              {process.env.NODE_ENV || 'undefined'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded">
            <h2 className="font-semibold">All NEXT_PUBLIC vars:</h2>
            <pre className="text-xs">
              {JSON.stringify(
                Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
                null,
                2
              )}
            </pre>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Förväntat:</strong> Du ska se din Stripe publishable key som börjar med "pk_live_" eller "pk_test_"
          </p>
        </div>
      </div>
    </div>
  );
} 