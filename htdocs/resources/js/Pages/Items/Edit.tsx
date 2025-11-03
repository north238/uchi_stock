import Form from "./Partials/Form";
import { usePage, useForm, Head } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { showSuccessToast } from "@/utils/toast";

interface Item {
  id: number;
  name: string;
  quantity: number;
  genre_id: number | null;
  place_id: number | null;
}

export default function Edit({ auth }: PageProps) {
  const { apiUrl, item } = usePage<{ apiUrl: string; item: Item }>().props;

  const form = useForm({
    name: item?.name ?? "",
    quantity: item?.quantity ?? 1,
    memo: "",
    genre_id: item?.genre_id ?? null,
    place_id: item?.place_id ?? null,
  });

  const { data, setData, put, processing, errors } = form;

  const handleSubmit = () => {
    put(route("items.update", item.id), {
      preserveScroll: true,
      onSuccess: () => {
        showSuccessToast("更新しました");
      },
    });
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
      <Form
        data={data}
        setData={setData}
        onSubmit={handleSubmit}
        apiUrl={apiUrl}
        errors={errors}
        processing={processing}
      />
    </Authenticated>
  );
}
