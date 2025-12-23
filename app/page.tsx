
import Login from './(auth)/login/page';

export default function Home() {
  return (
    <div className=" flex items-center justify-center bg-gray-50 min-h-screen py-10">
      <div className="min-h-screen w-full max-w-md flex items-center justify-center">
       
        <Login />
      </div>
    </div>
  );
}