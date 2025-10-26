import { router, usePage } from "@inertiajs/react";
import Form from "./Partials/Form";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";

interface Item {
  id: number;
  name: string;
  quantity: number;
}

export default function Edit({ auth }: PageProps) {
  const { apiUrl, item } = usePage<{ apiUrl: string; item: Item }>().props;

  const handleSubmit = (data: { name: string; quantity: number }) => {
    router.put(`/items/${item.id}`, data);
  };

  return (
    <Authenticated
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          アイテム編集
        </h2>
      }
    >
      <Head title="アイテム編集" />
      <Form initialValues={item} onSubmit={handleSubmit} apiUrl={apiUrl} />
    </Authenticated>
  );
}
