import React, { useState, useRef } from "react";
import { Box, Button, ChakraProvider, FormControl, FormLabel, Input, List, ListItem, Text, VStack, extendTheme, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select } from "@chakra-ui/react";
import { FaMousePointer, FaSave, FaEdit, FaTrash } from "react-icons/fa";
import { client } from "lib/crud";

const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
    },
  },
});

const Index = () => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("");
  const [elements, setElements] = useState([]);
  const iframeRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleElementClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(e.target);
    onOpen();
  };

  const saveElement = async () => {
    const elementData = {
      label,
      category,
      tagName: selectedElement.tagName,
      innerText: selectedElement.innerText.slice(0, 50),
    };
    await client.set(`element:${Date.now()}`, elementData);
    setElements([...elements, elementData]);
    setLabel("");
    onClose();
  };

  const deleteElement = async (index) => {
    const key = `element:${elements[index].createdAt}`;
    await client.delete(key);
    const updatedElements = [...elements];
    updatedElements.splice(index, 1);
    setElements(updatedElements);
  };

  const loadElements = async () => {
    const loadedElements = await client.getWithPrefix("element:");
    setElements(loadedElements.map((e) => e.value));
  };

  return (
    <ChakraProvider theme={theme}>
      <Box p={4}>
        <VStack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">
            Webpage Inspector
          </Text>
          <Button leftIcon={<FaMousePointer />} colorScheme="blue" onClick={() => iframeRef.current.contentWindow.document.body.addEventListener("click", handleElementClick)}>
            Start Inspecting
          </Button>
          <iframe ref={iframeRef} src="/" title="Site" style={{ width: "100%", height: "500px" }} />
          <List spacing={3}>
            {elements.map((element, index) => (
              <ListItem key={index} p={2} shadow="md" borderWidth="1px">
                <Text as="span" fontWeight="bold">
                  {element.label}:
                </Text>{" "}
                {element.tagName} - {element.innerText} - {element.category}
                <IconButton
                  aria-label="Edit"
                  icon={<FaEdit />}
                  onClick={() => {
                    setSelectedElement(element);
                    setLabel(element.label);
                    setCategory(element.category || "");
                    onOpen();
                  }}
                />
                <IconButton aria-label="Delete" icon={<FaTrash />} onClick={() => deleteElement(index)} />
              </ListItem>
            ))}
          </List>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Label Element</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Label</FormLabel>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Enter label for the element" />
              <FormLabel mt={4}>Category</FormLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Select category">
                <option value="Header">Header</option>
                <option value="Footer">Footer</option>
                <option value="Main Content">Main Content</option>
                <option value="Sidebar">Sidebar</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveElement} leftIcon={<FaSave />}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default Index;
