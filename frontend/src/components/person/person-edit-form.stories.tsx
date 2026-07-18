import type { Meta, StoryObj } from '@storybook/react-vite'
import { PersonEditForm } from '@/components/person/person-edit-form'
import type { PersonFormValues } from '@/components/person/person-form'

const emptyValues: PersonFormValues = {
  name: '',
  profileImageUrl: null,
  gender: '',
  relationType: '',
  relationTagChipIds: [],
  likes: [],
  cautions: [],
  favorite: false,
  firstMetYear: '',
  firstMetMonth: '',
  firstMetDay: '',
  lastMetDate: '',
  birthMonth: '',
  birthDay: '',
  birthYear: '',
}

const prefilledValues: PersonFormValues = {
  name: '김민수',
  profileImageUrl: 'https://picsum.photos/200',
  gender: 'MALE',
  relationType: '회사 동료',
  relationTagChipIds: [1, 3],
  likes: ['등산', '아메리카노'],
  cautions: ['갑작스런 약속'],
  favorite: true,
  firstMetYear: '2019',
  firstMetMonth: '4',
  firstMetDay: '12',
  lastMetDate: '2026-06-01',
  birthMonth: '8',
  birthDay: '23',
  birthYear: '1990',
}

const relationTags = [
  { id: 1, label: '대학 동기' },
  { id: 2, label: '동아리' },
  { id: 3, label: '같은 동네', color: '#f97316' },
]

const meta = {
  title: 'Person/PersonEditForm',
  component: PersonEditForm,
  tags: ['autodocs'],
  args: {
    initialValues: emptyValues,
    relationTags: [],
    onSubmit: () => {},
    onDelete: () => {},
  },
  render: (args) => (
    <div className="max-w-lg p-4">
      <PersonEditForm {...args} />
    </div>
  ),
} satisfies Meta<typeof PersonEditForm>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Prefilled: Story = {
  args: { initialValues: prefilledValues },
}

export const WithRelationTags: Story = {
  args: { initialValues: prefilledValues, relationTags },
}
