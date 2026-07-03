import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Programs from '@/pages/Programs'
import ProgramCreate from '@/pages/ProgramCreate'
import ProgramDetail from '@/pages/ProgramDetail'
import SurveyList from '@/pages/SurveyList'
import SurveyEditor from '@/pages/SurveyEditor'
import SurveyResponder from '@/pages/SurveyResponder'
import ParticipantList from '@/pages/ParticipantList'
import AssignmentRules from '@/pages/AssignmentRules'
import Reports from '@/pages/Reports'
import Administration from '@/pages/Administration'
import EmailTemplateList from '@/pages/EmailTemplateList'
import EmailTemplateEditor from '@/pages/EmailTemplateEditor'
import CycleEditor from '@/pages/m360/CycleEditor'
import RaterSelectionReview from '@/pages/m360/RaterSelectionReview'
import CycleReport from '@/pages/m360/CycleReport'

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public respondent routes — standalone, no nav/header */}
        <Route path="/respond/:token" element={<SurveyResponder />} />
        <Route path="/survey/:surveyId/respond" element={<SurveyResponder />} />

        {/* M360 token routes — standalone (participant / manager / rater links) */}
        <Route path="/m360/rater-selection/:token" element={<RaterSelectionReview />} />
        <Route path="/m360/approval/:token" element={<RaterSelectionReview />} />
        <Route path="/m360/feedback/:token" element={<SurveyResponder />} />

        {/* Admin routes — inside Layout with nav/header */}
        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/new" element={<ProgramCreate />} />
          <Route path="/programs/:programId" element={<ProgramDetail />} />
          <Route path="/programs/:programId/edit" element={<ProgramCreate />} />
          <Route path="/programs/:programId/cycles/new" element={<CycleEditor />} />
          <Route path="/programs/:programId/cycles/:cycleId" element={<CycleEditor />} />
          <Route path="/m360/report/:cycleId/:participantId" element={<CycleReport />} />
          <Route path="/surveys" element={<SurveyList />} />
          <Route path="/surveys/new" element={<SurveyEditor />} />
          <Route path="/surveys/:surveyId/edit" element={<SurveyEditor />} />
          <Route path="/participants" element={<ParticipantList />} />
          <Route path="/rules" element={<AssignmentRules />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/admin" element={<Administration />} />
          <Route path="/communications" element={<EmailTemplateList />} />
          <Route path="/communications/new" element={<EmailTemplateEditor />} />
          <Route path="/communications/:templateId/edit" element={<EmailTemplateEditor />} />
          {/* Legacy redirects */}
          <Route path="/templates" element={<EmailTemplateList />} />
          <Route path="/templates/new" element={<EmailTemplateEditor />} />
          <Route path="/templates/:templateId/edit" element={<EmailTemplateEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
