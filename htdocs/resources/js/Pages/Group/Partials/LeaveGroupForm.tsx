import { FormEventHandler } from "react";
import DangerButton from "@/Components/DangerButton";
import { useForm } from "@inertiajs/react";
import { User } from "@/types";

export default function LeaveGroupForm({
    className = "", auth
}: {
    className?: string;
    auth: {
        user: User;
    }
}) {
    const { patch, processing } = useForm();

    const leaveGroup: FormEventHandler = (e) => {
        e.preventDefault();

        const groupId = auth.user.group?.id;
        if (!groupId) {
            return;
        }

        patch(route("group.leave", groupId));
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    グループ脱退
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    グループを脱退すると、作成したアイテムの情報は管理できなくなります。
                    <br />
                    脱退後は、グループのメンバーとしての権限がなくなります。
                    <br />
                    再度グループに参加する場合は、グループの管理者に依頼してください。
                    <br />
                </p>
            </header>

            <DangerButton onClick={leaveGroup} disabled={processing}>
                脱退する
            </DangerButton>
        </section>
    );
}
