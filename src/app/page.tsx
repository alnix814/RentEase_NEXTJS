import { CardDemo } from "@/components/ui/rent-card";

export default function Home() {
  const cardData = [
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
    { name: "Уютный дом", address: "Аляска", price: 120000 },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-5">
      <div className="mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-8">
          {cardData.map((card, index) => (
            <div key={index} className="w-full">
              <CardDemo
                imageSrc={["/img.png", "/img.png", "/img.png"]}
                name={card.name}
                address={card.address}
                price={card.price}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
