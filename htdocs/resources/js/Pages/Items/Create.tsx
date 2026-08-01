import Form from "./Partials/Form";
import { useForm, Head, Link } from "@inertiajs/react";
import { MdArrowBack } from "react-icons/md";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import PageContainer from "@/Components/PageContainer";
import PageHeading from "@/Components/PageHeading";
import { PageProps } from "@/types";
import { ItemStatusValue } from "@/constants/itemStatus";

export default function Create({ auth }: PageProps) {
  const form = useForm({
    name: "",
    status: "in_stock" as ItemStatusValue,
    quantity: null as number | null,
    memo: "",
    genre_id: null,
    place_id: null,
  });

  const { data, setData, post, processing, errors, reset } = form;

  const handleSubmit = () => {
    post(route("items.store"), {
      preserveScroll: true,
      onSuccess: () => {
        reset("name", "status", "quantity", "memo", "genre_id", "place_id");
      },
    });
  };

  return (
    <Authenticated
      user={auth.user}
    >
      <Head title="アイテム登録" />
      <PageContainer>
        <Link
          href={route("items.index")}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <MdArrowBack className="h-4 w-4" />
          戻る
        </Link>
        <PageHeading>アイテム登録</PageHeading>
        <div className="mt-4">
          <Form
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            errors={errors}
            processing={processing}
          />
        </div>
      </PageContainer>
    </Authenticated>
  );
}
