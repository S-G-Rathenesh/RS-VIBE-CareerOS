import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { ROUTES } from '../constants/routes'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <h1 className="text-8xl font-black gradient-text">404</h1>
      <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
      <p className="text-sm text-gray-400 max-w-md">
        The route you are trying to access does not exist or has been relocated.
      </p>
      <Link to={ROUTES.HOME} className="mt-4">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  )
}
