import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/layout";

const UserBadgeItem = ({ user, handleFunction, admin, currentuser }) => {

    if (!user || !user._id) return null;
    if (!admin || !admin._id) return null;
    if (!currentuser || !currentuser._id) return null;

    return (
        <Badge
            px={2}
            py={1}
            borderRadius="lg"
            m={1}
            mb={2}
            variant="solid"
            fontSize={12}
            colorScheme="purple"
        >
            {user.name}
            {admin._id === user._id && (
                <span style={{ color: "white" }}> (Admin)</span>
            )}
            {admin._id === currentuser._id && (
                <CloseIcon
                    pl={1}
                    onClick={handleFunction}
                    cursor="pointer"
                    style={{ marginLeft: "5px" }}
                />
            )}
        </Badge>
    );
};

export default UserBadgeItem;
