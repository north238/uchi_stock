import Form from "./Partials/Form";
import { usePage, useForm, Head } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { ItemStatusValue } from "@/constants/itemStatus";

interface Item {
  id: number;
  name: string;
  status: ItemStatusValue;
  quantity: number | null;
  genre_id: number | null;
  place_id: number | null;
}

export default function Edit({ auth }: PageProps) {
  const { item } = usePage<{ item: Item }>().props;

  const form = useForm({
    name: item?.name ?? "",
    status: item?.status ?? ("in_stock" as ItemStatusValue),
    quantity: item?.quantity ?? null,
    memo: "",
    genre_id: item?.genre_id ?? null,
    place_id: item?.place_id ?? null,
  });

  const { data, setData, put, processing, errors } = form;

  const handleSubmit = () => {
    put(route("items.update", item.id), {
      preserveScroll: true,
    });
  };

  return (
    <Authenticated
      user={auth.user}
    >
      <Head title="アイテム編集" />
      <Form
        data={data}
        setData={setData}
        onSubmit={handleSubmit}
        errors={errors}
        processing={processing}
      />
    </Authenticated>
  );
}
