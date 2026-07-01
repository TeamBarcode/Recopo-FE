import { useState } from 'react'
import Button from '@/components/common/Button'
import FAB from '@/components/common/FAB'
import Chip from '@/components/common/Chip'
import Dropdown from '@/components/common/Dropdown'

function App() {
  const [isSelected, setIsSelected] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')

  return (
    <div>
      <Button variant="primary" onClick={() => {}}>저장하기</Button>
      <FAB size="lg" onClick={() => {}} icon={<span>+</span>} />
      <Chip label="stars 높은 순" isSelected={isSelected} onClick={() => setIsSelected(!isSelected)} />
      <Dropdown size="sm" options={['교육', '소셜']} value={selectedValue} onChange={(val) => setSelectedValue(val === selectedValue ? '' : val)}  placeholder="카테고리" />
    </div>
  )
}

export default App