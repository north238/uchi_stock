import Form from "./Partials/Form";
import { usePage, useForm, Head } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";

export default function Create({ auth }: PageProps) {
  const { apiUrl } = usePage<{ apiUrl: string }>().props;
  const form = useForm({
    name: "",
    quantity: 1,
    memo: "",
    genre_id: null,
    place_id: null,
  });

  const { data, setData, post, processing, errors, reset } = form;

  const handleSubmit = () => {
    post(route("items.store"), {
      preserveScroll: true,
      onSuccess: () => {
        reset("name", "quantity", "memo", "genre_id", "place_id");
      },
    });
  };

  return (
    <Authenticated
      user={auth.user}
    >
      <Head title="アイテム登録" />
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
