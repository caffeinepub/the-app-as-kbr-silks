import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  type FabricType = {
    #Kanjivaram;
    #Banarasi;
    #Mysore;
  };

  module FabricType {
    public func compare(type1 : FabricType, type2 : FabricType) : Order.Order {
      switch (type1, type2) {
        case (#Kanjivaram, #Banarasi) { #less };
        case (#Kanjivaram, #Mysore) { #less };
        case (#Banarasi, #Kanjivaram) { #greater };
        case (#Banarasi, #Mysore) { #less };
        case (#Mysore, #Kanjivaram) { #greater };
        case (#Mysore, #Banarasi) { #greater };
        case (_) { #equal };
      };
    };
  };

  type Saree = {
    id : Nat;
    name : Text;
    description : Text;
    fabricType : FabricType;
    color : Text;
    price : Nat;
    stock : Nat;
    image : Storage.ExternalBlob;
  };

  module Saree {
    public func compare(s1 : Saree, s2 : Saree) : Order.Order {
      Nat.compare(s1.id, s2.id);
    };

    public func compareByPrice(s1 : Saree, s2 : Saree) : Order.Order {
      Nat.compare(s1.price, s2.price);
    };
  };

  type OrderStatus = {
    #Pending;
    #Confirmed;
    #Shipped;
    #Delivered;
  };

  type OrderedItem = {
    sareeId : Nat;
    quantity : Nat;
  };

  type Order = {
    id : Nat;
    customerName : Text;
    customerPhone : Text;
    items : [OrderedItem];
    totalPrice : Nat;
    orderDate : Time.Time;
    status : OrderStatus;
  };

  module OrderHelpers {
    public func compare(order1 : Order, order2 : Order) : Order.Order {
      Nat.compare(order1.id, order2.id);
    };
  };

  type Customer = {
    name : Text;
    phone : Text;
    email : ?Text;
    address : Text;
    totalOrders : Nat;
  };

  module Customer {
    public func compare(customer1 : Customer, customer2 : Customer) : Order.Order {
      if (customer1.totalOrders < customer2.totalOrders) { return #less };
      if (customer1.totalOrders > customer2.totalOrders) { return #greater };
      #equal;
    };
  };

  let sarees = Map.empty<Nat, Saree>();
  let orders = Map.empty<Nat, Order>();
  let customers = Map.empty<Text, Customer>();

  var nextSareeId = 1;
  var nextOrderId = 1;

  // Saree Operations
  public shared ({ caller }) func addSaree(name : Text, description : Text, fabricType : FabricType, color : Text, price : Nat, stock : Nat, image : Storage.ExternalBlob) : async Nat {
    let id = nextSareeId;
    nextSareeId += 1;

    let saree : Saree = {
      id;
      name;
      description;
      fabricType;
      color;
      price;
      stock;
      image;
    };

    sarees.add(id, saree);
    id;
  };

  public shared ({ caller }) func updateSaree(id : Nat, name : Text, description : Text, fabricType : FabricType, color : Text, price : Nat, stock : Nat, image : Storage.ExternalBlob) : async () {
    if (not sarees.containsKey(id)) {
      Runtime.trap("Saree not found");
    };

    let saree : Saree = {
      id;
      name;
      description;
      fabricType;
      color;
      price;
      stock;
      image;
    };

    sarees.add(id, saree);
  };

  public shared ({ caller }) func deleteSaree(id : Nat) : async () {
    if (not sarees.containsKey(id)) {
      Runtime.trap("Saree not found");
    };
    sarees.remove(id);
  };

  public query ({ caller }) func getSaree(id : Nat) : async Saree {
    switch (sarees.get(id)) {
      case (null) { Runtime.trap("Saree not found") };
      case (?saree) { saree };
    };
  };

  public query ({ caller }) func getAllSarees() : async [Saree] {
    sarees.values().toArray().sort();
  };

  public query ({ caller }) func getSareesByPrice() : async [Saree] {
    sarees.values().toArray().sort(Saree.compareByPrice);
  };

  // Order Operations
  public shared ({ caller }) func placeOrder(customerName : Text, customerPhone : Text, items : [OrderedItem]) : async Nat {
    let totalPrice = items.foldLeft(0, func(acc, item) { acc + getSareePrice(item.sareeId) * item.quantity });

    let id = nextOrderId;
    nextOrderId += 1;

    let order : Order = {
      id;
      customerName;
      customerPhone;
      items;
      totalPrice;
      orderDate = Time.now();
      status = #Pending;
    };

    orders.add(id, order);
    id;
  };

  func getSareePrice(id : Nat) : Nat {
    switch (sarees.get(id)) {
      case (null) { 0 };
      case (?saree) { saree.price };
    };
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : OrderStatus) : async () {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          status
        };
        orders.add(id, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrder(id : Nat) : async Order {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray().sort();
  };

  // Customer Operations
  public shared ({ caller }) func addCustomer(name : Text, phone : Text, email : ?Text, address : Text) : async () {
    if (customers.containsKey(phone)) {
      Runtime.trap("Customer with this phone already exists");
    };

    let customer : Customer = {
      name;
      phone;
      email;
      address;
      totalOrders = 0;
    };

    customers.add(phone, customer);
  };

  public shared ({ caller }) func updateCustomer(phone : Text, name : Text, email : ?Text, address : Text) : async () {
    switch (customers.get(phone)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) {
        let updatedCustomer = {
          customer with
          name;
          email;
          address;
        };
        customers.add(phone, updatedCustomer);
      };
    };
  };

  public query ({ caller }) func getCustomer(phone : Text) : async Customer {
    switch (customers.get(phone)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) { customer };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    customers.values().toArray().sort();
  };
};
