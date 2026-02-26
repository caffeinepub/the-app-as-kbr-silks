import AccessControl "authorization/access-control";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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
    image : ?Storage.ExternalBlob;
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
    #Cancelled;
  };

  type OrderedItem = {
    sareeId : Nat;
    quantity : Nat;
  };

  type ProductDetail = {
    name : Text;
    fabricType : FabricType;
    color : Text;
    unitPrice : Nat;
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
    paymentStatus : Text;
    productDetails : [ProductDetail];
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

  type UserProfile = {
    name : Text;
  };

  public type SareeError = {
    #AlreadyExists;
    #NotFound;
    #Unauthorized;
    #StorageError : Text;
    #ValidationError : Text;
  };

  let sarees = Map.empty<Nat, Saree>();
  let orders = Map.empty<Nat, Order>();
  let customers = Map.empty<Text, Customer>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextSareeId = 1;
  var nextOrderId = 1;

  // User Profile Operations
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return ?("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    ?"User profile saved successfully";
  };

  // Saree Operations
  public shared ({ caller }) func addSaree(
    name : Text,
    description : Text,
    fabricType : FabricType,
    color : Text,
    price : Nat,
    stock : Nat,
    image : ?Storage.ExternalBlob,
  ) : async {
    #Ok : Nat;
    #Err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #Err("Unauthorized: Only admins can add sarees");
    };

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
    #Ok(id);
  };

  public shared ({ caller }) func updateSaree(
    id : Nat,
    name : Text,
    description : Text,
    fabricType : FabricType,
    color : Text,
    price : Nat,
    stock : Nat,
    image : ?Storage.ExternalBlob,
  ) : async {
    #Ok : Text;
    #Err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #Err("Unauthorized: Only admins can update sarees");
    };

    switch (sarees.get(id)) {
      case (null) { #Err("Saree not found") };
      case (?existing) {
        let updatedSaree : Saree = {
          existing with
          name;
          description;
          fabricType;
          color;
          price;
          stock;
          image;
        };
        sarees.add(id, updatedSaree);
        #Ok("Saree updated successfully");
      };
    };
  };

  public shared ({ caller }) func deleteSaree(id : Nat) : async {
    #Ok : Text;
    #Err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #Err("Unauthorized: Only admins can delete sarees");
    };

    switch (sarees.get(id)) {
      case (null) { #Err("Saree not found") };
      case (_) {
        sarees.remove(id);
        #Ok("Saree deleted successfully");
      };
    };
  };

  public query func getSaree(id : Nat) : async ?Saree {
    sarees.get(id);
  };

  public query func getAllSarees() : async [Saree] {
    sarees.values().toArray().sort();
  };

  public query func getSareesByPrice() : async [Saree] {
    sarees.values().toArray().sort(Saree.compareByPrice);
  };

  // Order Operations - requires authenticated user (not guest)
  public shared ({ caller }) func placeOrder(
    customerName : Text,
    customerPhone : Text,
    items : [OrderedItem],
    productDetails : [ProductDetail],
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can place orders");
    };

    let totalPrice = items.foldLeft(
      0,
      func(acc, item) {
        acc + getSareePrice(item.sareeId) * item.quantity;
      },
    );

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
      paymentStatus = "Pending";
      productDetails;
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

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : OrderStatus) : async {
    #Ok : Text;
    #Err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #Err("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(id)) {
      case (null) { #Err("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          status;
        };
        orders.add(id, updatedOrder);
        #Ok("Order status updated successfully");
      };
    };
  };

  public shared ({ caller }) func updatePaymentStatus(id : Nat, paymentStatus : Text) : async {
    #Ok : Text;
    #Err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #Err("Unauthorized: Only admins can update payment status");
    };

    switch (orders.get(id)) {
      case (null) { #Err("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          paymentStatus;
        };
        orders.add(id, updatedOrder);
        #Ok("Payment status updated successfully");
      };
    };
  };

  public query ({ caller }) func getOrder(id : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view order details");
    };

    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    orders.values().toArray().sort();
  };

  public shared ({ caller }) func addCustomer(name : Text, phone : Text, email : ?Text, address : Text) : async {
    #Ok : Text;
    #Err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #Err("Unauthorized: Only admins can add customers");
    };

    if (customers.containsKey(phone)) {
      return #Err("Customer with this phone already exists");
    };

    let customer : Customer = {
      name;
      phone;
      email;
      address;
      totalOrders = 0;
    };

    customers.add(phone, customer);
    #Ok("Customer added successfully");
  };

  public shared ({ caller }) func updateCustomer(phone : Text, name : Text, email : ?Text, address : Text) : async {
    #Ok : Text;
    #Err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #Err("Unauthorized: Only admins can update customers");
    };

    switch (customers.get(phone)) {
      case (null) { #Err("Customer not found") };
      case (?customer) {
        let updatedCustomer = {
          customer with
          name;
          email;
          address;
        };
        customers.add(phone, updatedCustomer);
        #Ok("Customer updated successfully");
      };
    };
  };

  public query ({ caller }) func getCustomer(phone : Text) : async Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view customer details");
    };

    switch (customers.get(phone)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) { customer };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all customers");
    };

    customers.values().toArray().sort();
  };
};
