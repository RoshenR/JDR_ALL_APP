import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { DiceRoller } from '@/components/dice/DiceRoller'
import { getCurrentUser } from '@/lib/actions/auth'
import { getMyDiceRolls } from '@/lib/actions/dice'

export default async function DicePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const history = await getMyDiceRolls(50)

  return (
    <>
      <Header
        title="Lanceur de dés"
        description="Lancez vos dés avec animation 3D"
        user={user}
      />

      <div className="p-6">
        <DiceRoller initialHistory={history} />
      </div>
    </>
  )
}
