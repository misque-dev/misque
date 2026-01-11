import { Container } from '@/components/container';

interface Props {
  children?: React.ReactNode;
}

export const MainLines = ({ children }: Props) => {
  return (
    <Container className="w-full max-w-full overflow-hidden">
      <div className="min-h-screen md:border-r md:border-l mx-auto max-w-5xl pt-12 w-full">
        {children}
      </div>
    </Container>
  );
};
