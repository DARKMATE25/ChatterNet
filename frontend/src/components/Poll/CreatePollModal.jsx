import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, Button, Input, Checkbox, Stack
} from "@chakra-ui/react";
import { useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

const CreatePollModal = ({ isOpen, onClose, onCreate }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [anonymous, setAnonymous] = useState(false);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [expiry, setExpiry] = useState("");

  const handleCreate = () => {
    onCreate({
      question,
      options,
      anonymous,
      multipleChoice,
      expiresAt: expiry ? new Date(expiry) : null,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        >
        Create Poll

        <IconButton
            icon={<CloseIcon />}
            size="sm"
            variant="ghost"
            aria-label="Close poll"
            onClick={onClose}
        />
        </ModalHeader>

        <ModalBody>
          <Input placeholder="Poll question" mb={3} onChange={e => setQuestion(e.target.value)} />

          {options.map((opt, i) => (
            <Input
              key={i}
              placeholder={`Option ${i + 1}`}
              mb={2}
              onChange={e => {
                const copy = [...options];
                copy[i] = e.target.value;
                setOptions(copy);
              }}
            />
          ))}

          <Button size="sm" onClick={() => setOptions([...options, ""])}>+ Add Option</Button>

          <Stack mt={4}>
            {/* <Checkbox onChange={e => setAnonymous(e.target.checked)}>Anonymous</Checkbox>
            <Checkbox onChange={e => setMultipleChoice(e.target.checked)}>Multiple Choice</Checkbox>
            <Checkbox>Allow Vote Change</Checkbox>
            <Input type="datetime-local" placeholder="Expiry time" onChange={e => setExpiry(e.target.value)} /> */}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={handleCreate}>Create</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreatePollModal;
