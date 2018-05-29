// @flow
import * as React from "react";
import { connect } from "react-redux";
import { Droppable, Draggable } from "react-beautiful-dnd";
import shortid from "shortid";
import Textarea from "react-textarea-autosize";
import FaPencil from "react-icons/lib/fa/pencil";
import FaTimesCircle from "react-icons/lib/fa/times-circle";
import FaPlusSquare from "react-icons/lib/fa/plus-square";
import ClickOutside from "./ClickOutside";

type Props = {
  boardId: string,
  list: {
    title: string,
    id: string,
    cards: Array<string>
  },
  cards: Array<{ title: string, id: string }>,
  dispatch: ({ type: string }) => void
};

type State = {
  cardComposerIsOpen: boolean,
  newCardTitle: string,
  cardInEdit: ?string,
  editableCardTitle: string,
  isListTitleInEdit: boolean,
  newListTitle: string
};

class List extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      cardComposerIsOpen: false,
      newCardTitle: "",
      cardInEdit: null,
      editableCardTitle: "",
      isListTitleInEdit: false,
      newListTitle: ""
    };
  }

  toggleCardComposer = () =>
    this.setState({ cardComposerIsOpen: !this.state.cardComposerIsOpen });

  handleCardComposerChange = (event: { target: { value: string } }) => {
    this.setState({ newCardTitle: event.target.value });
  };

  handleKeyDown = (event: SyntheticEvent<>) => {
    if (event.keyCode === 13) {
      this.handleSubmitCard(event);
    }
  };

  handleSubmitCard = event => {
    event.preventDefault();
    const { newCardTitle } = this.state;
    const { list, dispatch } = this.props;
    if (newCardTitle === "") return;
    dispatch({
      type: "ADD_CARD",
      payload: {
        cardId: shortid.generate(),
        cardTitle: newCardTitle,
        listId: list.id
      }
    });
    this.setState({ newCardTitle: "", cardComposerIsOpen: false });
  };

  openCardEditor = card => {
    this.setState({ cardInEdit: card.id, editableCardTitle: card.title });
  };

  handleCardEditorChange = (event: { target: { value: string } }) => {
    this.setState({ editableCardTitle: event.target.value });
  };

  handleEditKeyDown = (event: SyntheticEvent<>) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.handleSubmitCardEdit();
    }
  };

  handleSubmitCardEdit = () => {
    const { editableCardTitle, cardInEdit } = this.state;
    const { list, dispatch } = this.props;
    if (editableCardTitle === "") return;
    dispatch({
      type: "EDIT_CARD_TITLE",
      payload: {
        cardId: cardInEdit,
        cardTitle: editableCardTitle,
        listId: list.id
      }
    });
    this.setState({ editableCardTitle: "", cardInEdit: null });
  };

  deleteCard = cardId => {
    const { dispatch, list } = this.props;
    dispatch({ type: "DELETE_CARD", payload: { cardId, listId: list.id } });
  };

  openTitleEditor = () => {
    this.setState({
      isListTitleInEdit: true,
      newListTitle: this.props.list.title
    });
  };

  handleListTitleEditorChange = (event: { target: { value: string } }) => {
    this.setState({ newListTitle: event.target.value });
  };

  handleListTitleKeyDown = (event: SyntheticEvent<>) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.handleSubmitListTitle();
    }
  };

  handleSubmitListTitle = () => {
    const { newListTitle } = this.state;
    const { list, dispatch } = this.props;
    if (newListTitle === "") return;
    dispatch({
      type: "EDIT_LIST_TITLE",
      payload: {
        listTitle: newListTitle,
        listId: list.id
      }
    });
    this.setState({
      isListTitleInEdit: false,
      newListTitle: ""
    });
  };

  deleteList = () => {
    const { list, boardId, dispatch } = this.props;
    dispatch({
      type: "DELETE_LIST",
      payload: {
        listId: list.id,
        boardId,
        cards: list.cards
      }
    });
  };

  render = () => {
    const { cards, list } = this.props;
    const {
      cardComposerIsOpen,
      newCardTitle,
      cardInEdit,
      editableCardTitle,
      isListTitleInEdit,
      newListTitle
    } = this.state;
    return (
      <div className="list">
        {isListTitleInEdit ? (
          <div className="list-title-textarea-wrapper">
            <Textarea
              autoFocus
              useCacheForDOMMeasurements
              value={newListTitle}
              onChange={this.handleListTitleEditorChange}
              onKeyDown={this.handleListTitleKeyDown}
              className="list-title-textarea"
              onBlur={this.handleSubmitListTitle}
            />
          </div>
        ) : (
          <div className="list-title">
            <button
              onFocus={this.openTitleEditor}
              onClick={this.openTitleEditor}
              className="list-title-button"
            >
              {list.title}
            </button>
            <FaTimesCircle onClick={this.deleteList} className="delete-list-button" />
          </div>
        )}
        <Droppable droppableId={list.id}>
          {provided => (
            <div className="cards" ref={provided.innerRef}>
              {cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {({
                    innerRef,
                    draggableProps,
                    dragHandleProps,
                    placeholder
                  }) => (
                    <div>
                      {cardInEdit !== card.id ? (
                        <div
                          className="card-title"
                          ref={innerRef}
                          {...draggableProps}
                          {...dragHandleProps}
                          data-react-beautiful-dnd-draggable="0"
                          data-react-beautiful-dnd-drag-handle="0"
                        >
                          <span>{card.title}</span>

                            <FaTimesCircle
                              onClick={() => this.deleteCard(card.id)}
                              className="delete-card-button"
                            />
                            <FaPencil
                              onClick={() => this.openCardEditor(card)}
                              className="edit-card-button"
                            />
                        </div>
                      ) : (
                        <div className="textarea-wrapper">
                          <Textarea
                            autoFocus
                            useCacheForDOMMeasurements
                            minRows={3}
                            value={editableCardTitle}
                            onChange={this.handleCardEditorChange}
                            onKeyDown={this.handleEditKeyDown}
                            className="list-textarea"
                            onBlur={this.handleSubmitCardEdit}
                          />
                        </div>
                      )}
                      {placeholder}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {cardComposerIsOpen && (
                <ClickOutside handleClickOutside={this.toggleCardComposer}>
                  <form
                    onSubmit={this.handleSubmitCard}
                    className="textarea-wrapper"
                  >
                    <Textarea
                      autoFocus
                      useCacheForDOMMeasurements
                      minRows={3}
                      onChange={this.handleCardComposerChange}
                      onKeyDown={this.handleKeyDown}
                      value={newCardTitle}
                      className="list-textarea"
                    />
                    <input
                      type="submit"
                      value="Add"
                      className="action-button submit-card-button"
                      disabled={newCardTitle === ""}
                    />
                  </form>
                </ClickOutside>
              )}
              {cardComposerIsOpen || (
                <div
                  className="open-composer-container"
                >
                  <button
                    className="action-button open-composer-button"
                    onClick={this.toggleCardComposer}
                  >
                      Add new card
                  </button>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    );
  };
}

const mapStateToProps = (state, ownProps) => ({
  cards: ownProps.list.cards.map(cardId => state.cards[cardId])
});

export default connect(mapStateToProps)(List);