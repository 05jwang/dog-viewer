import React, { useEffect, useState } from "react";
import { Tree, TreeNodeInfo, Card, Spinner, Checkbox, InputGroup, Button } from "@blueprintjs/core";
import { useRecoilState } from "recoil";
import { breedsState } from "../../recoil/atoms";

const BreedSelectorTree: React.FC = () => {
  const [breeds, setBreeds] = useState<TreeNodeInfo[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<TreeNodeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBreeds, setSelectedBreeds] = useRecoilState(breedsState);
  const [searchText, setSearchText] = useState("");

  /**
   * Updates the specified node in the tree with the new expanded state when a parent node is expanded or collapsed.
   * Normally we would recursively update all children nodes as well, but since there can be at most 1 level of children,
   * we only need to update the first level of nodes.
   *
   * @param nodeId - The ID of the node to update.
   * @param isExpanded - The new expanded state of the node.
   * @param nodes - The array of tree nodes.
   * @returns The updated array of tree nodes.
   */
  const updateNode = (nodeId: string, isExpanded: boolean, nodes: TreeNodeInfo[]): TreeNodeInfo[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, isExpanded };
      }
      return node;
    });
  };

  /**
   * Handles the checking/unchecking of a breed node in the BreedSelectorTree component.
   *
   * @param breed - The breed to be checked/unchecked.
   * @param children - The children nodes of the breed.
   */
  const handleNodeCheck = (breed: string, children: TreeNodeInfo[]) => {
    if (selectedBreeds.includes(breed)) {
      // If the breed is already selected, deselect it
      setSelectedBreeds((prev) => prev.filter((b) => b !== breed));
      if (children.length > 0) {
        // Remove all sub-breeds when the parent breed is deselected
        children.forEach((child) => {
          setSelectedBreeds((prev) => prev.filter((b) => b !== child.id));
        });
      }
      // If the breed is a sub-breed, check if the parent breed should be deselected
      if (breed.indexOf("/") !== -1) {
        const parentBreed = breed.split("/")[0];
        if (selectedBreeds.includes(parentBreed)) {
          // If none of the sub-breeds are selected, deselect the parent breed
          const subBreeds = children.map((child) => child.id as string);
          if (subBreeds.every((subBreed) => !selectedBreeds.includes(subBreed))) {
            setSelectedBreeds((prev) => prev.filter((b) => b !== parentBreed));
          }
        }
      }
    } else {
      // If the breed is not selected, select it
      setSelectedBreeds((prev) => [...prev, breed]);
      // If the breed has sub-breeds, select all sub-breeds
      if (children.length > 0) {
        children.forEach((child) => {
          setSelectedBreeds((prev) => [...prev, child.id as string]);
        });
      }
      // If the breed is a sub-breed, check if the parent breed should be selected
      if (breed.indexOf("/") !== -1) {
        const parentBreed = breed.split("/")[0];
        if (!selectedBreeds.includes(parentBreed)) {
          // If every sub-breed is selected, select the parent breed
          const subBreeds = children.map((child) => child.id as string);
          if (subBreeds.every((subBreed) => selectedBreeds.includes(subBreed))) {
            setSelectedBreeds((prev) => [...prev, parentBreed]);
          }
        }
      }
    }
  };

  /**
   * Handles the expansion of a tree node.
   *
   * @param nodeData - The data of the node being expanded.
   */
  const handleNodeExpand = (nodeData: TreeNodeInfo) => {
    const updatedFilteredNodes = updateNode(nodeData.id as string, true, filteredNodes);
    setFilteredNodes(updatedFilteredNodes);
  };

  /**
   * Handles the collapse event of a tree node.
   * @param nodeData The data of the collapsed node.
   */
  const handleNodeCollapse = (nodeData: TreeNodeInfo) => {
    const updatedFilteredNodes = updateNode(nodeData.id as string, false, filteredNodes);
    setFilteredNodes(updatedFilteredNodes);
  };

  /**
   * Filters the nodes based on the provided text in the search input.
   * If the text is empty or null, all nodes are de-expanded.
   *
   * @param text - The text to filter the nodes with.
   * @param nodes - The array of TreeNodeInfo objects to filter.
   * @returns The filtered array of TreeNodeInfo objects.
   */
  const filterNodes = (text: string, nodes: TreeNodeInfo[]): TreeNodeInfo[] => {
    // de-expand all nodes if search text is empty
    if (text === "" || text == null) return breeds.map((node) => ({ ...node, isExpanded: false }));
    return nodes
      .map((node) => {
        const newNode = { ...node };
        if (node.childNodes) {
          newNode.childNodes = filterNodes(text, node.childNodes);
        }
        if (node.label.toString().toLowerCase().includes(text.toLowerCase())) {
          return newNode;
        } else if (newNode.childNodes && newNode.childNodes.length > 0) {
          newNode.childNodes = newNode.childNodes.filter((child) =>
            child.label.toString().toLowerCase().includes(text.toLowerCase())
          );
          node.isExpanded = newNode.childNodes.length > 0;
          return newNode;
        }
        return null;
      })
      .filter((node) => node !== null) as TreeNodeInfo[];
  };

  /**
   * Handles the change event of the search input.
   * Updates the search text and filters the nodes based on the new text.
   *
   * @param event - The change event object.
   * @returns void
   */
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    console.log("text", text);
    setSearchText(text);
    setFilteredNodes(filterNodes(text, breeds));
  };

  /**
   * Helper function to capitalize the first letter of a string.
   *
   * @param s - The string to capitalize.
   * @returns The string with the first letter capitalized.
   */
  const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  /**
   * Helper function to find all breeds in the tree of nodes.
   *
   * @param nodes - The tree of nodes to search.
   * @returns An array of strings representing all the breeds found.
   */
  const findAllBreeds = (nodes: TreeNodeInfo[]): string[] => {
    return nodes.reduce((acc, node) => {
      if (node.childNodes && node.childNodes.length > 0) {
        return [...acc, node.id as string, ...findAllBreeds(node.childNodes)];
      }
      return [...acc, node.id as string];
    }, [] as string[]);
  };

  /**
   * Fetches the list of dog breeds from the Dog CEO API and populates the tree of breeds.
   */
  useEffect(() => {
    setIsLoading(true);
    fetch("https://dog.ceo/api/breeds/list/all")
      .then((response) => {
        response.json().then((data) => {
          const breeds = data.message;
          /**
           * Maps the breeds object to an array of TreeNodeInfo objects.
           */
          const breedNodes: TreeNodeInfo[] = Object.keys(breeds).map((breed) => {
            const subBreeds = breeds[breed];
            // This node will have children
            if (subBreeds.length > 0) {
              return {
                id: breed,
                label: capitalize(breed),
                hasCaret: true,
                nodeData: {
                  checked: false,
                },
                secondaryLabel: (
                  <Checkbox
                    checked={selectedBreeds.includes(breed)}
                    onChange={() => {
                      handleNodeCheck(breed, subBreeds);
                    }}
                  />
                ),
                childNodes: subBreeds.map((subBreed: string) => ({
                  id: `${breed}/${subBreed}`,
                  label: `${capitalize(subBreed)} ${capitalize(breed)}`,
                  hasCaret: false,
                  childNodes: [],
                  secondaryLabel: (
                    <Checkbox
                      checked={selectedBreeds.includes(`${breed}/${subBreed}`)}
                      onChange={() => {
                        handleNodeCheck(`${breed}/${subBreed}`, []);
                      }}
                    />
                  ),
                })),
              };
            } else {
              // This node will not have children
              return {
                id: breed,
                label: capitalize(breed),
                hasCaret: false,
                childNodes: [],
                secondaryLabel: (
                  <Checkbox
                    checked={selectedBreeds.includes(breed)}
                    onChange={() => {
                      setSelectedBreeds((prev) =>
                        prev.includes(breed) ? prev.filter((b) => b !== breed) : [...prev, breed]
                      );
                    }}
                  />
                ),
              };
            }
          });
          setBreeds(breedNodes);
          setFilteredNodes(breedNodes);
          setIsLoading(false);
        });
      })
      .catch((error) => {
        console.error("Error fetching breeds:", error);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  /**
   * Manually re-renders the tree of nodes when the selectedBreeds state changes.
   *
   * React does not re-render the tree when the value of the secondaryLabel (Checkbox) prop changes.
   * As a workaround, we map the nodes and force a re-render when the selectedBreeds state changes.
   *
   * @param nodes - The array of TreeNodeInfo objects to be mapped.
   * @returns The mapped array of TreeNodeInfo objects.
   */
  const mapNodes = (nodes: TreeNodeInfo[]): TreeNodeInfo[] => {
    return nodes.map((node) => {
      const newNode = { ...node };
      if (node.childNodes) {
        newNode.childNodes = mapNodes(node.childNodes);
      }
      newNode.secondaryLabel = (
        <Checkbox
          checked={selectedBreeds.includes(node.id as string)}
          indeterminate={
            node.childNodes &&
            node.childNodes.filter((child) => selectedBreeds.includes(child.id as string)).length > 0 &&
            node.childNodes.filter((child) => !selectedBreeds.includes(child.id as string)).length > 0
          }
          onChange={() => {
            handleNodeCheck(node.id as string, node.childNodes || []);
          }}
        />
      );
      return newNode;
    });
  };

  /**
   * Manually re-renders the tree of nodes when the selectedBreeds state changes.
   */
  useEffect(() => {
    setFilteredNodes(mapNodes(filteredNodes));
  }, [selectedBreeds]);

  return (
    <div>
      <Card
        style={{
          maxHeight: "calc(100vh - 325px)",
          overflowY: "auto",
          padding: "10px",
        }}
      >
        <h4
          style={{
            margin: "0px",
          }}
        >
          Breeds
        </h4>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <InputGroup
              leftIcon="search"
              placeholder="Search breeds..."
              value={searchText}
              onChange={handleSearchInputChange}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                margin: "5px",
              }}
            >
              <Button text="Deselect All" minimal onClick={() => setSelectedBreeds([])} />
            </div>
            <Tree contents={filteredNodes} onNodeExpand={handleNodeExpand} onNodeCollapse={handleNodeCollapse} />
          </>
        )}
      </Card>
    </div>
  );
};

export default BreedSelectorTree;
