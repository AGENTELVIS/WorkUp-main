import React from 'react'
import { SignIn,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,} from '@clerk/nextjs'

const Signin = () => {
  return (
    <>
      <div>
        <SignIn/>
      </div>
    </>
  )
}

export default Signin