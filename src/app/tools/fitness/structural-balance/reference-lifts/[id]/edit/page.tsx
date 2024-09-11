import EditRefLift from '../../../components/EditRefLift';

export default function EditReferenceLiftPage({ params }: { params: { id: string } }) {
  return <EditRefLift id={params.id} />;
}