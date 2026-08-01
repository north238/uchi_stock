import Form from "./Partials/Form";
import { usePage, useForm, Head, Link } from "@inertiajs/react";
import { MdArrowBack } from "react-icons/md";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import PageContainer from "@/Components/PageContainer";
import PageHeading from "@/Components/PageHeading";
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
    <Authenticated user={auth.user}>
      <Head title="ストック編集" />
      <PageContainer>
        <Link
          href={route("items.index")}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <MdArrowBack className="h-4 w-4" />
          戻る
        </Link>
        <PageHeading>ストック編集</PageHeading>
        <div className="mt-4">
          <Form
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            errors={errors}
            processing={processing}
            submitLabel="更新する"
          />
        </div>
      </PageContainer>
    </Authenticated>
  );
}
