import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the mediator page heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { level: 2, name: /mediador clínico/i })
    expect(heading).toBeInTheDocument()
  })
})
