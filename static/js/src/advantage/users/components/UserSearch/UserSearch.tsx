import React from "react";

const UserSearch = ({
  handleSearch,
}: {
  handleSearch: (value: string) => void;
}) => {
  const [searchInputValue, setSearchInputValue] = React.useState("");

  const handleSearchInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setSearchInputValue(event?.currentTarget?.value);
  };

  React.useEffect(() => {
    handleSearch(searchInputValue);
  }, [searchInputValue]);

  const resetSearchInput: React.MouseEventHandler<HTMLButtonElement> = () => {
    setSearchInputValue("");
  };

  return (
    <form
      className="p-search-box"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch(searchInputValue);
      }}
    >
      <input
        aria-label="Search for users"
        type="search"
        className="p-search-box__input"
        placeholder="Search for users"
        name="search"
        autoComplete="off"
        value={searchInputValue}
        onChange={handleSearchInputChange}
      />
      {searchInputValue.length > 0 ? (
        <button
          type="reset"
          aria-label="clear"
          className="p-search-box__reset"
          onClick={resetSearchInput}
        >
          <i className="p-icon--close"></i>
        </button>
      ) : null}
      <button
        type="submit"
        className="p-search-box__button"
        aria-label="search"
      >
        <i className="p-icon--search"></i>
      </button>
    </form>
  );
};

export default UserSearch;
