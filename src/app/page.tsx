import React from 'react'

const page = () => {
  return (
    <div>{process.env.NEXT_PUBLIC_SERVER_URL}</div>
  )
}

export default page