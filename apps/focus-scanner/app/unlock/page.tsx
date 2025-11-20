'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle, Lock, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function UnlockContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClient()
  
  // Calculate initial state based on token during render instead of in useEffect
  const [status, setStatus] = useState<'ready' | 'loading' | 'success' | 'error'>(() => {
    return !token ? 'error' : 'ready'
  })
  const [message, setMessage] = useState(() => {
    return !token ? 'Invalid unlock link' : ''
  })

  const handleUnlock = async () => {
    if (!token) return
    
    setStatus('loading')
    
    try {
      const { data, error } = await supabase
        .from('unlock_tokens')
        .select('*')
        .eq('token', token)
        .single()

      if (error || !data) {
        setStatus('error')
        setMessage('Invalid or expired token')
        return
      }

      if (data.consumed) {
        setStatus('error')
        setMessage('This token has already been used')
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        setStatus('error')
        setMessage('This token has expired')
        return
      }

      const { error: updateError } = await supabase
        .from('unlock_tokens')
        .update({ consumed: true })
        .eq('token', token)

      if (updateError) {
        setStatus('error')
        setMessage('Failed to unlock sites')
        return
      }

      setStatus('success')
      setMessage('Sites unlocked! You can close this page.')
    } catch {
      setStatus('error')
      setMessage('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center space-y-4 pb-4">
          {status === 'success' ? (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="size-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Success!</CardTitle>
              <CardDescription className="text-base">{message}</CardDescription>
            </>
          ) : status === 'error' ? (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="size-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Error</CardTitle>
              <CardDescription className="text-base">{message}</CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                <Lock className="size-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Unlock Blocked Sites?</CardTitle>
              <CardDescription className="text-base">
                This will give you access to your blocked websites
              </CardDescription>
            </>
          )}
        </CardHeader>
        {(status === 'ready' || status === 'loading') && (
          <CardContent className="space-y-3">
            <Button
              onClick={handleUnlock}
              disabled={status === 'loading'}
              className="w-full"
              size="lg"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                'Confirm Unlock'
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.close()}
              className="w-full"
              size="lg"
              disabled={status === 'loading'}
            >
              Cancel
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function UnlockFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
            <Lock className="size-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function UnlockPage() {
  return (
    <Suspense fallback={<UnlockFallback />}>
      <UnlockContent />
    </Suspense>
  )
}