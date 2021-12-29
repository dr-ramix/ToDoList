//jshint esversion:6
/* and end with */
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

//connecting app.js to mongoose
mongoose.connect("mongodb+srv://yourusername:<password>@cluster0.wdu1z.mongodb.net/newToDoListDB", {useNewUrlParser: true});

//creating a Schema for items
const itemsSchema = {
  name: String
};

//creating a model with name of Item, and itemsSchema
const Item = mongoose.model("Item", itemsSchema);

// creating items
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
// puting all of them to a list, so we can use .insertMany()
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("list", listSchema);

//inserting insertMany get to parmeter an arry and a call back function  for errors

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if( foundItems.length === 0){
      //inserting insertMany get to parmeter an arry and a call back function  for errors
      Item.insertMany(defaultItems, function(err){
              if (err) {
                console.log(err);
              } else {
                console.log("Successfully savevd default items to DB.");
              }
            });
            res.redirect("/")
    }else {
      if(err){
        console.log(err);
      } else {
        res.render("list", {listTitle: "Today", newListItems:foundItems});
      }
    }

  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
      } else {
        //show an exiting list

        res.render("list", {listTitle:foundList.name, newListItems:foundList.items});
      }
    }
  });

});



//----------------------------------------------------------------------------------

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

//-----------------------------------------------------------
app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if (listName ==="Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("Successfully deleted");
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName},{$pull: {_id: checkedItemId}}, function(err,foundList){
    if(!err) {
      res.redirect("/" + listName);
    }
  });

}


});



app.get("/about", function(req, res){
  res.render("about");
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started Successfully!");
});
