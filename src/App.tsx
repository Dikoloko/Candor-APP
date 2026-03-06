import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import QuizSetup from './components/quiz/QuizSetup'
import QuizGame from './components/quiz/QuizGame'
import QuizResult from './components/quiz/QuizResult'
import QuickFacts from './components/QuickFacts'
import Compare from './components/Compare'
import Database from './components/Database'
import ProjectDetail from './components/ProjectDetail'

function Root() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: 'quiz', element: <QuizSetup /> },
      { path: 'quiz/game', element: <QuizGame /> },
      { path: 'quiz/result', element: <QuizResult /> },
      { path: 'quick-facts', element: <QuickFacts /> },
      { path: 'compare', element: <Compare /> },
      { path: 'database', element: <Database /> },
      { path: 'project/:id', element: <ProjectDetail /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
